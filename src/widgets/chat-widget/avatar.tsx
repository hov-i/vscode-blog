"use client";

import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import type { AvatarMood } from "./types";

const MOOD_TO_GIF: Record<AvatarMood, string> = {
  idle: "/vi/idle.gif",
  thinking: "/vi/thinking.gif",
  typing: "/vi/typing.gif",
  happy: "/vi/happy.gif",
  confused: "/vi/confused.gif",
  error: "/vi/error.gif",
  wink: "/vi/wink.gif",
  nod: "/vi/nod.gif",
  love: "/vi/love.gif",
  sleepy: "/vi/sleepy.gif",
};

interface AvatarProps {
  state: AvatarMood;
  size?: number;
  className?: string;
}

export function ChatAvatar({ state, size = 48, className }: AvatarProps) {
  const src = MOOD_TO_GIF[state] ?? MOOD_TO_GIF.idle;
  return (
    <Image
      src={src}
      alt={`v_i ${state}`}
      width={size}
      height={size}
      unoptimized
      priority
      className={cn("select-none", className)}
    />
  );
}
