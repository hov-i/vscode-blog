"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/shared/ui/icon";
import { MarkdownRenderer } from "@/shared/ui/markdown-renderer";
import { cn } from "@/shared/lib/utils";
import { ChatAvatar } from "./avatar";
import { useChat } from "./use-chat";
import type { ChatState } from "./types";

const STATE_LABEL: Record<ChatState, string> = {
  idle: "무엇이든 물어보세요",
  thinking: "생각 중...",
  typing: "답변 중...",
  happy: "도움이 됐기를!",
  confused: "다시 한 번 말씀해 주실래요?",
  error: "연결에 문제가 생겼어요",
};

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const { messages, state, send, reset } = useChat();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, state]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const isBusy = state === "thinking" || state === "typing";

  const onSubmit = () => {
    const text = draft.trim();
    if (!text || isBusy) return;
    send(text);
    setDraft("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="v_i 챗봇"
      className={cn(
        "flex flex-col w-[min(92vw,22rem)] sm:w-96 h-[min(80vh,32rem)]",
        "bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-2xl overflow-hidden",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
        <ChatAvatar state={state} size={28} className="rounded" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
            v_i
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] leading-tight truncate">
            {STATE_LABEL[state]}
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          title="대화 초기화"
          className="p-1 rounded hover:bg-[var(--vscode-hover-bg)] text-[var(--text-secondary)]"
        >
          <Icon name="trash" className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="닫기"
          className="p-1 rounded hover:bg-[var(--vscode-hover-bg)] text-[var(--text-secondary)]"
        >
          <Icon name="close" className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-[var(--bg-primary)]"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] text-sm leading-relaxed px-3 py-2 rounded-lg",
                m.role === "user"
                  ? "bg-[var(--accent)] text-white rounded-br-sm whitespace-pre-wrap break-words"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-bl-sm border border-[var(--border-color)]",
              )}
            >
              {m.role === "user" ? (
                m.content
              ) : m.content ? (
                <div className="chat-markdown">
                  <MarkdownRenderer content={m.content} />
                </div>
              ) : (
                <span className="text-[var(--text-secondary)]">...</span>
              )}
            </div>
          </div>
        ))}
        {state === "thinking" && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] px-2">
              <ChatAvatar state="thinking" size={20} />
              <span>블로그를 뒤져보는 중...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={2000}
            placeholder={
              isBusy ? "답변을 기다려 주세요..." : "메시지 입력 (Enter 전송)"
            }
            disabled={isBusy}
            className={cn(
              "flex-1 resize-none max-h-24 text-sm px-3 py-2 rounded-md",
              "bg-[var(--bg-primary)] border border-[var(--border-color)]",
              "text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
              "focus:outline-none focus:border-[var(--accent)]",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            )}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={isBusy || draft.trim().length === 0}
            className={cn(
              "shrink-0 h-9 w-9 flex items-center justify-center rounded-md",
              "bg-[var(--accent)] text-white",
              "hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed",
              "transition-opacity",
            )}
            title="전송"
          >
            <Icon name="send" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
