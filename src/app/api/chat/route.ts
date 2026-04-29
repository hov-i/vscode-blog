import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, CHAT_MODEL } from "@/shared/lib/ai/anthropic";
import { SYSTEM_PROMPT } from "@/shared/lib/ai/system-prompt";
import { CHAT_TOOLS, executeTool } from "@/shared/lib/ai/tools";
import { checkRateLimit } from "@/shared/lib/ai/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_HISTORY_TURNS = 20;
const MAX_USER_CONTENT_LEN = 2000;
const MAX_TOOL_ITERATIONS = 3;

type IncomingMessage = { role: "user" | "assistant"; content: string };

function getClientKey(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isValidHistory(body: unknown): body is { messages: IncomingMessage[] } {
  if (!body || typeof body !== "object") return false;
  const { messages } = body as { messages?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) return false;
  for (const m of messages) {
    if (!m || typeof m !== "object") return false;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return false;
    if (typeof content !== "string") return false;
  }
  const last = messages[messages.length - 1] as IncomingMessage;
  if (last.role !== "user") return false;
  if (last.content.trim().length === 0) return false;
  if (last.content.length > MAX_USER_CONTENT_LEN) return false;
  return true;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("ANTHROPIC_API_KEY is not set", { status: 500 });
  }

  const key = getClientKey(req);
  const minute = checkRateLimit(`chat:min:${key}`, 10, 60_000);
  if (!minute.ok) {
    return new Response("잠시 후 다시 시도해 주세요.", {
      status: 429,
      headers: { "Retry-After": String(minute.retryAfterSec) },
    });
  }
  const day = checkRateLimit(`chat:day:${key}`, 100, 24 * 60 * 60_000);
  if (!day.ok) {
    return new Response("오늘의 대화 한도에 도달했어요. 내일 다시 만나요!", {
      status: 429,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("invalid json", { status: 400 });
  }
  if (!isValidHistory(body)) {
    return new Response("invalid messages", { status: 400 });
  }

  const trimmed = body.messages.slice(-MAX_HISTORY_TURNS);
  const working: Anthropic.MessageParam[] = trimmed.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (s: string) => controller.enqueue(encoder.encode(s));
      try {
        for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
          const apiStream = anthropic.messages.stream({
            model: CHAT_MODEL,
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            tools: CHAT_TOOLS,
            messages: working,
          });

          apiStream.on("text", (delta) => {
            enqueue(delta);
          });

          const final = await apiStream.finalMessage();

          if (final.stop_reason === "tool_use") {
            const toolUses = final.content.filter(
              (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
            );
            working.push({ role: "assistant", content: final.content });
            const results: Anthropic.ToolResultBlockParam[] = [];
            for (const tu of toolUses) {
              try {
                const out = await executeTool(tu.name, tu.input);
                results.push({
                  type: "tool_result",
                  tool_use_id: tu.id,
                  content: out,
                });
              } catch (err) {
                results.push({
                  type: "tool_result",
                  tool_use_id: tu.id,
                  content: `도구 실행 실패: ${
                    err instanceof Error ? err.message : String(err)
                  }`,
                  is_error: true,
                });
              }
            }
            working.push({ role: "user", content: results });
            continue;
          }

          break;
        }
        controller.close();
      } catch (err) {
        const msg =
          err instanceof Anthropic.RateLimitError
            ? "\n\n[Claude API 사용량 한도에 도달했어요. 잠시 뒤 다시 시도해 주세요.]"
            : err instanceof Anthropic.APIError
              ? `\n\n[응답을 받지 못했어요. (${err.status})]`
              : "\n\n[연결이 원활하지 않아요. 잠시 뒤 다시 시도해 주세요.]";
        enqueue(msg);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
    },
  });
}
