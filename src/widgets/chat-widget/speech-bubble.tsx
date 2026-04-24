"use client";

import { cn } from "@/shared/lib/utils";

const BUBBLE_W_MAX = 220;
const BUBBLE_OFFSET_Y = 56;

interface SpeechBubbleProps {
  text: string;
  anchorX: number;
  anchorY: number;
  buttonSize: number;
  /** Match the character's current CSS transition so the bubble tracks it */
  followTransition?: string;
}

export function SpeechBubble({
  text,
  anchorX,
  anchorY,
  buttonSize,
  followTransition,
}: SpeechBubbleProps) {
  if (typeof window === "undefined") return null;

  const characterCenterX = anchorX + buttonSize / 2;
  const showBelow = anchorY < 70;
  const topPosition = showBelow
    ? anchorY + buttonSize + 8
    : anchorY - BUBBLE_OFFSET_Y;

  let leftPosition = characterCenterX - BUBBLE_W_MAX / 2;
  leftPosition = Math.max(
    8,
    Math.min(leftPosition, window.innerWidth - BUBBLE_W_MAX - 8),
  );

  const tailFromLeft = characterCenterX - leftPosition;
  const tailClamped = Math.max(22, Math.min(tailFromLeft, BUBBLE_W_MAX - 22));

  return (
    <div
      className="fixed z-50 pointer-events-none animate-vi-bubble"
      style={{
        left: leftPosition,
        top: topPosition,
        maxWidth: BUBBLE_W_MAX,
        transition:
          followTransition ??
          "left 1.6s cubic-bezier(0.22, 1, 0.36, 1), top 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
        transformOrigin: showBelow ? "top center" : "bottom center",
      }}
    >
      <div
        className={cn(
          "relative inline-block",
          "px-3.5 py-2",
          "text-[13px] leading-snug",
          "text-[var(--text-primary)]",
          "bg-[var(--bg-secondary)]",
          "rounded-[18px]",
          "shadow-[0_6px_16px_-4px_rgba(0,0,0,0.35)]",
          "whitespace-pre-wrap break-keep",
        )}
      >
        {text}
      </div>
      {/* Trailing dots — thought-cloud style */}
      <span
        aria-hidden
        className="absolute block rounded-full bg-[var(--bg-secondary)] shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
        style={{
          width: 8,
          height: 8,
          left: tailClamped - 4,
          ...(showBelow ? { top: -6 } : { bottom: -6 }),
        }}
      />
      <span
        aria-hidden
        className="absolute block rounded-full bg-[var(--bg-secondary)] shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
        style={{
          width: 5,
          height: 5,
          left: tailClamped - 2 + (characterCenterX > leftPosition + BUBBLE_W_MAX / 2 ? 6 : -6),
          ...(showBelow ? { top: -12 } : { bottom: -12 }),
        }}
      />
    </div>
  );
}
