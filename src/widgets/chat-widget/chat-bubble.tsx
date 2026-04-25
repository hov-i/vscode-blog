"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage, ChatState } from "./types";

function renderLinkNode(
  label: string,
  href: string,
  key: string,
): React.ReactNode {
  const isExternal = /^https?:\/\//i.test(href);
  const className =
    "text-[var(--accent)] underline underline-offset-2 hover:opacity-80";
  return isExternal ? (
    <a
      key={key}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  ) : (
    <Link key={key} href={href} className={className}>
      {label}
    </Link>
  );
}

function renderWithLinks(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let buffer = "";
  let i = 0;
  let linkIdx = 0;

  const flush = () => {
    if (buffer) {
      parts.push(buffer);
      buffer = "";
    }
  };

  while (i < text.length) {
    if (text[i] === "[") {
      let depth = 1;
      let j = i + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === "[") depth += 1;
        else if (text[j] === "]") depth -= 1;
        if (depth > 0) j += 1;
      }
      if (depth === 0 && text[j + 1] === "(") {
        const labelEnd = j;
        const urlStart = j + 2;
        let urlEnd = urlStart;
        while (
          urlEnd < text.length &&
          text[urlEnd] !== ")" &&
          !/\s/.test(text[urlEnd]!)
        ) {
          urlEnd += 1;
        }
        if (urlEnd < text.length && text[urlEnd] === ")") {
          const label = text.slice(i + 1, labelEnd);
          const href = text.slice(urlStart, urlEnd);
          flush();
          parts.push(renderLinkNode(label, href, `l-${linkIdx}`));
          linkIdx += 1;
          i = urlEnd + 1;
          continue;
        }
      }
    }
    buffer += text[i];
    i += 1;
  }
  flush();
  return parts.length === 0 ? text : parts;
}

const BUBBLE_W = 320;
const BUBBLE_MAX_H = 420;
const BUBBLE_GAP = 14;
const MOBILE_BREAKPOINT = 640;
const MOBILE_SIDE_PAD = 8;
const MOBILE_BOTTOM_PAD = 8;

const SUBTITLE: Record<ChatState, string> = {
  idle: "온라인",
  thinking: "생각 중...",
  typing: "입력 중...",
  happy: "온라인",
  confused: "온라인",
  error: "연결 문제",
};

interface ChatBubbleProps {
  anchorX: number;
  anchorY: number;
  buttonSize: number;
  messages: ChatMessage[];
  state: ChatState;
  onSend: (text: string) => void;
  onReset: () => void;
  onClose: () => void;
}

export function ChatBubble({
  anchorX,
  anchorY,
  buttonSize,
  messages,
  state,
  onSend,
  onReset,
  onClose,
}: ChatBubbleProps) {
  const [draft, setDraft] = useState("");
  const [viewport, setViewport] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1024,
    h: typeof window !== "undefined" ? window.innerHeight : 768,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose]);

  if (typeof window === "undefined") return null;

  const isMobile = viewport.w < MOBILE_BREAKPOINT;

  const bubbleWidth = isMobile
    ? viewport.w - MOBILE_SIDE_PAD * 2
    : BUBBLE_W;
  const bubbleMaxH = isMobile
    ? Math.min(viewport.h - 24, Math.round(viewport.h * 0.72))
    : BUBBLE_MAX_H;

  let leftPosition: number;
  let topPosition: number;
  let showBelow = false;

  if (isMobile) {
    leftPosition = MOBILE_SIDE_PAD;
    topPosition = viewport.h - bubbleMaxH - MOBILE_BOTTOM_PAD;
  } else {
    const characterCenterX = anchorX + buttonSize / 2;
    showBelow = anchorY < bubbleMaxH + 30;
    topPosition = showBelow
      ? anchorY + buttonSize + BUBBLE_GAP
      : Math.max(8, anchorY - bubbleMaxH - BUBBLE_GAP);

    leftPosition = characterCenterX - bubbleWidth / 2;
    leftPosition = Math.max(
      8,
      Math.min(leftPosition, viewport.w - bubbleWidth - 8),
    );
  }

  const isBusy = state === "thinking" || state === "typing";

  const submit = () => {
    const text = draft.trim();
    if (!text || isBusy) return;
    onSend(text);
    setDraft("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="v_i 채팅"
      className="fixed z-50 animate-vi-bubble-open"
      style={{
        left: leftPosition,
        top: topPosition,
        width: bubbleWidth,
        transition: isMobile
          ? "none"
          : "left 0.45s cubic-bezier(0.22, 1, 0.36, 1), top 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        transformOrigin: isMobile
          ? "bottom center"
          : showBelow
            ? "top center"
            : "bottom center",
      }}
    >
      <div
        className={cn(
          "relative flex flex-col",
          "bg-[var(--bg-secondary)]",
          "rounded-2xl overflow-hidden",
          "shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6),0_6px_12px_-4px_rgba(0,0,0,0.35)]",
        )}
        style={{ maxHeight: bubbleMaxH }}
      >
        {/* Header — messenger-style */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--bg-tertiary)]">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[var(--border-color)]">
            <Image
              src="/vi/happy.gif"
              alt="v_i"
              width={32}
              height={32}
              unoptimized
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[13px] font-semibold text-[var(--text-primary)]">
              v_i
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
              <span
                className={cn(
                  "inline-block w-1.5 h-1.5 rounded-full",
                  state === "error"
                    ? "bg-red-400"
                    : isBusy
                      ? "bg-amber-400 animate-pulse"
                      : "bg-green-400",
                )}
              />
              {SUBTITLE[state]}
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            title="대화 초기화"
            className="p-1 rounded-full hover:bg-[var(--vscode-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Icon name="trash" className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="닫기 (Esc)"
            className="p-1 rounded-full hover:bg-[var(--vscode-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Icon name="close" className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages — messenger bubbles */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-[var(--bg-secondary)]"
          style={{ maxHeight: bubbleMaxH - 110 }}
        >
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div
                  className={cn(
                    "max-w-[78%] px-3 py-1.5",
                    "bg-[var(--accent)] text-white",
                    "rounded-2xl rounded-br-sm",
                    "text-[13px] leading-snug whitespace-pre-wrap break-words",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <div
                  className={cn(
                    "max-w-[82%] px-3 py-1.5",
                    "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
                    "rounded-2xl rounded-bl-sm",
                    "border border-[var(--border-color)]",
                    "text-[13px] leading-snug whitespace-pre-wrap break-words",
                  )}
                >
                  {m.content ? (
                    renderWithLinks(m.content)
                  ) : (
                    <TypingDots />
                  )}
                </div>
              </div>
            ),
          )}
          {isBusy && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="px-3 py-2 bg-[var(--bg-tertiary)] rounded-2xl rounded-bl-sm border border-[var(--border-color)]">
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* Input — cozy rounded */}
        <div className="flex items-end gap-2 p-2.5 bg-[var(--bg-tertiary)]">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={2000}
            disabled={isBusy}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={isBusy ? "응답 받는 중..." : "메시지 보내기"}
            className={cn(
              "flex-1 resize-none outline-none",
              "px-3 py-1.5 rounded-full",
              "bg-[var(--bg-primary)] border border-[var(--border-color)]",
              "text-[13px] text-[var(--text-primary)]",
              "placeholder:text-[var(--text-secondary)]",
              "focus:border-[var(--accent)]",
              "disabled:opacity-50",
            )}
            style={{ maxHeight: 80, minHeight: 30 }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={isBusy || draft.trim().length === 0}
            title="전송 (Enter)"
            className={cn(
              "shrink-0 w-8 h-8 flex items-center justify-center rounded-full",
              "bg-[var(--accent)] text-white",
              "hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed",
              "transition-opacity",
            )}
          >
            <Icon name="send" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center" aria-label="입력 중">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}
