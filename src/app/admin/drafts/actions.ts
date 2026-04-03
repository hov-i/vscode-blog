"use server"

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const BLOG_STYLE_TEMPLATE = `
## 블로그 글쓰기 스타일 가이드

### 공통 말투 & 톤
- 1인칭 경험담 중심 ("나는 ~했다", "~게 느꼈다")
- 딱딱하지 않고 솔직하게, 감정 자연스럽게 표현
- 과도한 기술 용어 나열 금지, 맥락과 함께 설명

### 글 유형 1: 경험/회고 글
구조: 헤더 없이 도입 문단 → ## 헤더로 섹션 구분 → 마지막 회고

### 글 유형 2: 기술 학습 정리 글
구조:
1. 첫 줄: > 블록쿼트로 이 글을 쓰게 된 동기
2. # 헤더로 섹션 구분 (개념 소개 → 상세 → 비교 → 결론)
3. 마지막 섹션: # 마치며
`

const ADMIN_EMAIL = 'dbsghdql55555@gmail.com'

async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function publishDraft(formData: FormData) {
  const { supabase, user } = await ensureAdmin()

  const draftId = Number(formData.get('draftId'))
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const tagsString = formData.get('tags') as string

  const tagNames = tagsString
    ? tagsString.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const tagsConnect = []
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    tagsConnect.push({ id: tag.id })
  }

  const prismaUser = await prisma.user.upsert({
    where: { email: user.email! },
    update: {},
    create: {
      email: user.email!,
      name: user.user_metadata?.full_name || user.email!.split('@')[0],
    },
  })

  await prisma.post.create({
    data: {
      title,
      description: description || '',
      content,
      published: true,
      authorId: prismaUser.id,
      tags: { connect: tagsConnect },
    },
  })

  // draft 상태를 published로 업데이트
  await supabase
    .from('draft_posts')
    .update({ status: 'published' })
    .eq('id', draftId)

  revalidatePath('/posts')
  revalidatePath('/')
  redirect('/posts')
}

export async function deleteDraft(draftId: number) {
  const { supabase } = await ensureAdmin()

  await supabase
    .from('draft_posts')
    .delete()
    .eq('id', draftId)

  revalidatePath('/admin/drafts')
}

export async function regenerateDraft(draftId: number): Promise<{
  title: string
  description: string
  content: string
  tags: string
}> {
  const { supabase } = await ensureAdmin()

  // 1. conversation_data 조회
  const { data: draft, error } = await supabase
    .from('draft_posts')
    .select('conversation_data, source_project')
    .eq('id', draftId)
    .single()

  if (error || !draft) throw new Error('Draft를 찾을 수 없어요!')
  if (!draft.conversation_data) throw new Error('재생성용 대화 데이터가 없어요!')

  const conversation = draft.conversation_data as {
    projectName: string
    messages: { role: string; text: string }[]
  }

  // 2. Claude API 재호출
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const conversationText = conversation.messages
    .map((m) => `[${m.role === 'user' ? '나' : 'AI'}] ${m.text}`)
    .join('\n\n')

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `아래는 "${conversation.projectName}" 프로젝트 개발 중 AI와 나눈 대화야.
이 대화에서 블로그 포스팅으로 만들 만한 내용을 뽑아서 블로그 글로 작성해줘.

${BLOG_STYLE_TEMPLATE}

반드시 아래 JSON 배열 형식으로만 응답해. 다른 텍스트 없이:
[
  {
    "title": "글 제목",
    "description": "한 줄 요약",
    "content": "마크다운 본문 전체",
    "tags": ["태그1", "태그2"]
  }
]

대화 내용:
---
${conversationText}
---`,
      },
    ],
  })

  const text = res.content[0]
  if (text.type !== 'text') throw new Error('Claude 응답 형식 오류')

  const raw = text.text.trim()
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('Claude 응답에서 JSON을 찾을 수 없어요!')
  const parsed = JSON.parse(raw.slice(start, end + 1))
  const newDraft = parsed[0]

  // 3. draft_posts 업데이트
  await supabase
    .from('draft_posts')
    .update({
      title: newDraft.title,
      description: newDraft.description,
      content: newDraft.content,
      tags: Array.isArray(newDraft.tags) ? newDraft.tags.join(',') : newDraft.tags,
    })
    .eq('id', draftId)

  revalidatePath('/admin/drafts')

  return {
    title: newDraft.title,
    description: newDraft.description ?? '',
    content: newDraft.content,
    tags: Array.isArray(newDraft.tags) ? newDraft.tags.join(',') : (newDraft.tags ?? ''),
  }
}
