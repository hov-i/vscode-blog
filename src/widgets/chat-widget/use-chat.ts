"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatState } from "./types";

const STORAGE_KEY = "vi-chat-history-v1";
const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "안녕하세요! 저는 윤홍비의 블로그 챗봇 **v_i** 에요.\n\n제 블로그 글을 검색해서 답변해 드릴 수 있어요. 커피챗하듯 편하게 물어봐 주세요 ☕",
};

function newId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [WELCOME];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [WELCOME];
    return parsed as ChatMessage[];
  } catch {
    return [WELCOME];
  }
}

function saveHistory(messages: ChatMessage[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // ignore quota errors
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [state, setState] = useState<ChatState>("idle");
  const [hydrated, setHydrated] = useState(false);
  const stateResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // localStorage is only available after hydration; this is the
    // documented React pattern for hydration-safe client-only state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(loadHistory());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveHistory(messages);
  }, [messages, hydrated]);

  const scheduleIdle = useCallback((ms = 2000) => {
    if (stateResetRef.current) clearTimeout(stateResetRef.current);
    stateResetRef.current = setTimeout(() => setState("idle"), ms);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || state === "thinking" || state === "typing") return;

      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
      };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setState("thinking");

      const assistantId = newId();
      const historyForApi = nextMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const resp = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyForApi }),
        });

        if (!resp.ok || !resp.body) {
          const errText =
            resp.status === 429
              ? (await resp.text()) ||
                "잠깐, 조금 뒤에 다시 말 걸어주세요."
              : "지금 연결이 원활하지 않아요. 잠시 뒤 다시 시도해 주세요.";
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: errText },
          ]);
          setState("error");
          scheduleIdle(3000);
          return;
        }

        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: "" },
        ]);

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let firstChunk = true;
        let assembled = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          if (firstChunk) {
            setState("typing");
            firstChunk = false;
          }
          assembled += chunk;
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.id === assistantId) {
              copy[copy.length - 1] = { ...last, content: assembled };
            }
            return copy;
          });
        }

        if (assembled.trim().length === 0) {
          setState("confused");
        } else {
          setState("happy");
        }
        scheduleIdle(2000);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content:
              "지금 연결이 원활하지 않아요. 잠시 뒤 다시 시도해 주세요.",
          },
        ]);
        setState("error");
        scheduleIdle(3000);
      }
    },
    [messages, state, scheduleIdle],
  );

  const reset = useCallback(() => {
    setMessages([WELCOME]);
    setState("idle");
  }, []);

  return { messages, state, send, reset };
}
