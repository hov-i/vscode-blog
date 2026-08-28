import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, CHAT_MODEL } from "@/shared/lib/ai/anthropic";
import { CHAT_TOOLS, executeTool } from "@/shared/lib/ai/tools";
import { checkRateLimit } from "@/shared/lib/ai/rate-limit";

export const runtime = "nodejs";

const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY = 20;
const MAX_TOOL_ROUNDS = 3;

const SYSTEM_PROMPT = `너는 hov_i의 개인 포트폴리오 블로그에 내장된 터미널 챗봇이야. 방문자가 hov_i의 프로젝트, 기술 경험, 블로그 글에 대해 물어보면 도와줘.

규칙:
- 블로그 글/프로젝트/기술 경험에 대한 질문이면 답하기 전에 반드시 search_posts 툴을 먼저 호출해서 근거를 확인해.
- 검색 결과가 없으면 없다고 솔직히 말해. 지어내지 마.
- 답변은 터미널 출력처럼 간결하게. 불필요한 마크다운 제목이나 장황한 서론 없이 핵심만.
- 존댓말 대신 친근한 반말 톤을 유지해 (hov_i 블로그의 말투).
- 코드/기술 질문이 아니면 대화하듯 짧게 응답해.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function parseHistory(body: unknown): ChatMessage[] {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) {
    throw new Error("messages 배열이 필요해요");
  }
  const raw = (body as { messages: unknown[] }).messages;

  const messages: ChatMessage[] = raw
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m as ChatMessage).role !== undefined &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string",
    )
    .slice(-MAX_HISTORY);

  if (messages.length === 0) throw new Error("메시지가 비어있어요");

  const last = messages[messages.length - 1];
  if (last.role !== "user") throw new Error("마지막 메시지는 user여야 해요");
  if (!last.content.trim()) throw new Error("빈 메시지는 보낼 수 없어요");
  if (last.content.length > MAX_MESSAGE_LENGTH) throw new Error("메시지가 너무 길어요");

  return messages;
}

type BlockAcc =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; inputJson: string };

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, RATE_LIMIT, RATE_LIMIT_WINDOW_MS);
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "rate_limited", retryAfterSec: rl.retryAfterSec }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  let history: ChatMessage[];
  try {
    const body = await req.json();
    history = parseHistory(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "잘못된 요청이에요";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        const messages: Anthropic.MessageParam[] = history.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const apiStream = await anthropic.messages.create({
            model: CHAT_MODEL,
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            tools: CHAT_TOOLS,
            tool_choice: { type: "auto" },
            messages,
            stream: true,
          });

          const blocks: BlockAcc[] = [];
          let stopReason: string | null = null;

          for await (const event of apiStream) {
            if (event.type === "content_block_start") {
              const block = event.content_block;
              if (block.type === "text") {
                blocks[event.index] = { type: "text", text: "" };
              } else if (block.type === "tool_use") {
                blocks[event.index] = { type: "tool_use", id: block.id, name: block.name, inputJson: "" };
                send({ type: "tool", name: block.name });
              }
            } else if (event.type === "content_block_delta") {
              const acc = blocks[event.index];
              if (event.delta.type === "text_delta" && acc?.type === "text") {
                acc.text += event.delta.text;
                send({ type: "text", text: event.delta.text });
              } else if (event.delta.type === "input_json_delta" && acc?.type === "tool_use") {
                acc.inputJson += event.delta.partial_json;
              }
            } else if (event.type === "message_delta") {
              stopReason = event.delta.stop_reason ?? stopReason;
            }
          }

          const assistantContent: Anthropic.ContentBlockParam[] = blocks
            .filter((b): b is BlockAcc => !!b)
            .map((b) =>
              b.type === "text"
                ? { type: "text", text: b.text }
                : { type: "tool_use", id: b.id, name: b.name, input: JSON.parse(b.inputJson || "{}") },
            );
          messages.push({ role: "assistant", content: assistantContent });

          if (stopReason !== "tool_use") break;

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const b of blocks) {
            if (b?.type === "tool_use") {
              const result = await executeTool(b.name, JSON.parse(b.inputJson || "{}"));
              toolResults.push({ type: "tool_result", tool_use_id: b.id, content: result });
            }
          }
          messages.push({ role: "user", content: toolResults });
        }

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
