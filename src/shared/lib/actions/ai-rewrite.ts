"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/shared/lib/supabase/server";

const ADMIN_EMAIL = "dbsghdql55555@gmail.com";

const BLOG_STYLE_TEMPLATE = `
## 블로그 글쓰기 스타일 가이드

### 공통 말투 & 톤
- 1인칭 경험담 중심 ("나는 ~했다", "~게 느꼈다")
- 딱딱하지 않고 솔직하게, 감정 자연스럽게 표현
- 과도한 기술 용어 나열 금지, 맥락과 함께 설명
`;

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) throw new Error("Unauthorized");
}

export async function rewriteSelection({
  fullContent,
  selectedText,
  instruction,
}: {
  fullContent: string;
  selectedText: string;
  instruction: string;
}): Promise<string> {
  await ensureAdmin();

  if (!selectedText.trim()) throw new Error("선택된 텍스트가 비어있어요!");
  if (!instruction.trim()) throw new Error("수정 요청 내용을 입력해줘!");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    tools: [
      {
        name: "rewrite_text",
        description: "선택된 텍스트를 사용자 요청대로 수정해서 반환",
        input_schema: {
          type: "object" as const,
          properties: {
            rewritten: {
              type: "string",
              description:
                "수정된 텍스트만 (설명/주석/따옴표 없이, 마크다운 그대로 유지)",
            },
          },
          required: ["rewritten"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "rewrite_text" },
    messages: [
      {
        role: "user",
        content: `아래는 블로그 글 전체 본문이야 (문맥 참고용):
---
${fullContent}
---

위 글에서 다음 부분만 수정해줘:
---
${selectedText}
---

수정 요청: ${instruction}

${BLOG_STYLE_TEMPLATE}

규칙:
- 수정된 텍스트만 반환 (앞뒤 따옴표 없이)
- 마크다운 포맷이면 그대로 유지
- 앞뒤 문맥과 자연스럽게 연결되도록
- 원본의 들여쓰기/줄바꿈 스타일을 따라가기
- 1인칭 솔직한 말투 유지`,
      },
    ],
  });

  const toolUse = res.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use")
    throw new Error("Claude 응답에서 수정 결과를 찾을 수 없어요!");

  const input = toolUse.input as { rewritten: string };
  return input.rewritten;
}
