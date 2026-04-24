import type Anthropic from "@anthropic-ai/sdk";
import { searchPosts } from "./search";

export const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_posts",
    description:
      "블로그에 공개된(published) 글을 키워드로 검색합니다. 기술·경험·회고·프로젝트 관련 질문에 답하기 전에 반드시 호출하세요. 결과가 비어 있으면 블로그에 관련 글이 없다는 뜻입니다.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "검색 키워드. 한국어 1~3개 단어를 공백으로 구분. 예: 'React 성능', 'Next.js 배포'.",
        },
      },
      required: ["query"],
    },
  },
];

export async function executeTool(
  name: string,
  input: unknown,
): Promise<string> {
  if (name === "search_posts") {
    const { query } = (input ?? {}) as { query?: unknown };
    if (typeof query !== "string") {
      return JSON.stringify({
        error: "query must be a string",
        results: [],
      });
    }
    const results = await searchPosts(query);
    return JSON.stringify({ query, count: results.length, results });
  }
  return JSON.stringify({ error: `unknown tool: ${name}` });
}
