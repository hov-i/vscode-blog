"use server"

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAIL = 'dbsghdql55555@gmail.com'

// NOTE: auto-blog-posting/src/summarize.ts의 BLOG_STYLE_TEMPLATE / generateFromCluster
// 와 동일한 로직. Vercel function 배포 후엔 HTTP 호출로 전환할 예정.
const BLOG_STYLE_TEMPLATE = `
## 블로그 글쓰기 스타일 가이드

### 공통 말투 & 톤
- 1인칭 경험담 중심 ("나는 ~했다", "~게 느꼈다", "~인 줄 알았는데")
- 딱딱하지 않고 솔직하게, 감정 자연스럽게 표현
- "사실 ~라는 단점이 있었는데", "생각보다 ~해서 감동 받았다..", "~게 마음에 들었다" 같은 표현 자주 사용
- 과도한 기술 용어 나열 금지, 맥락과 함께 설명

### 글 유형 1: 경험/회고 글 (프로젝트, 협업, 이벤트 참여 후기)
구조:
1. 맨 첫 줄: > 블록쿼트로 이 글을 쓰게 된 계기/맥락 1~2문장
2. 빈 줄 하나 띄운 뒤 ## 헤더로 섹션 구분
3. 기술 선택은 "왜 선택했는지", "어떤 점이 좋았는지" 위주로 풀어서 설명
4. 이슈/문제는 솔직하게 언급 후 어떻게 해결했는지 공유
5. 마지막: 회고 또는 앞으로의 계획으로 마무리 (희망적인 톤)

### 글 유형 2: 기술 학습 정리 글 (개념 공부, 라이브러리 분석, 트러블슈팅)
구조:
1. 맨 첫 줄: > 블록쿼트로 이 글을 쓰게 된 상황 설명
2. 빈 줄 하나 띄운 뒤 # 헤더로 첫 번째 섹션 시작
3. 글의 흐름은 "개념 소개 → 상세 설명 → 비교/분석 → 결론" 순서로
4. 코드 예시는 언어 명시한 코드블록으로
5. 마지막 섹션은 반드시 # 마치며
6. 참고 URL 있으면 #### Reference 추가

### 글 유형 선택 기준
- 프로젝트 경험, 협업, 이벤트, 회고 → 유형 1
- 개념 공부, 라이브러리 비교, 에러 해결, 기술 분석 → 유형 2
`

interface StoredInsight {
  topic: string
  summary: string
  techStack: string[]
  sourceProject: string
  excerpt: string
}

async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function generateFromCluster(clusterId: number): Promise<{
  draftPostId: number
  title: string
}> {
  const { supabase } = await ensureAdmin()

  const { data: cluster, error: fetchErr } = await supabase
    .from('topic_clusters')
    .select('*')
    .eq('id', clusterId)
    .single()

  if (fetchErr || !cluster) throw new Error('Cluster를 찾을 수 없어요!')
  if (cluster.is_drafted) throw new Error('이미 발제된 cluster')

  const insights = (cluster.insights ?? []) as StoredInsight[]
  if (insights.length === 0) throw new Error('cluster에 인사이트가 없어요')

  const insightText = insights
    .map(
      (i) =>
        `[${i.sourceProject}]\n주제: ${i.topic}\n내용: ${i.summary}\n발췌: ${i.excerpt}\n기술스택: ${i.techStack.join(', ')}`,
    )
    .join('\n\n---\n\n')

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    tools: [
      {
        name: 'create_blog_post',
        description: '인사이트 클러스터로 블로그 포스트를 생성한다',
        input_schema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '블로그 글 제목' },
            description: { type: 'string', description: '한 줄 요약' },
            content: { type: 'string', description: '마크다운 본문 전체' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: '태그 목록',
            },
          },
          required: ['title', 'description', 'content', 'tags'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'create_blog_post' },
    messages: [
      {
        role: 'user',
        content: `아래 인사이트들을 합쳐서 블로그 글 하나를 작성해줘.

주제: ${cluster.theme}
글쓰기 방향: ${cluster.angle ?? '-'}

${BLOG_STYLE_TEMPLATE}

⚠️ content 작성 규칙:
- 첫 줄은 반드시 "> " blockquote로 시작 (이 글을 쓰게 된 계기/동기)
- 그 다음 빈 줄 하나 띄운 뒤 본문 시작
- 기술 학습 글: # 헤더, 경험/회고 글: ## 헤더

인사이트:
---
${insightText}
---`,
      },
    ],
  })

  const toolUse = res.content.find((c) => c.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude 응답에서 tool_use를 찾을 수 없어요')
  }

  const draft = toolUse.input as {
    title: string
    description: string
    content: string
    tags: string[]
  }

  const sourceProjects: string[] = cluster.source_projects ?? []

  const { data: inserted, error: insertErr } = await supabase
    .from('draft_posts')
    .insert({
      title: draft.title,
      description: draft.description,
      content: draft.content,
      tags: draft.tags.join(','),
      source_project: sourceProjects.join(', '),
      conversation_data: null,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (insertErr || !inserted) {
    throw new Error(`draft_posts insert 실패: ${insertErr?.message}`)
  }

  await supabase
    .from('topic_clusters')
    .update({ is_drafted: true, drafted_post_id: inserted.id })
    .eq('id', clusterId)

  revalidatePath('/admin/topics')
  revalidatePath('/admin/drafts')

  return { draftPostId: inserted.id, title: draft.title }
}

export async function deleteCluster(clusterId: number): Promise<void> {
  const { supabase } = await ensureAdmin()

  const { error } = await supabase
    .from('topic_clusters')
    .delete()
    .eq('id', clusterId)

  if (error) throw new Error(`cluster 삭제 실패: ${error.message}`)

  revalidatePath('/admin/topics')
}
