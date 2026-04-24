"use client";

import { useEffect, useMemo } from "react";

const FLOWER_EMOJIS = ["🌷", "🌻", "🌼", "🌸", "🌹", "💐", "🪷"];

type Flower = {
  id: number;
  left: number;
  top: number;
  emoji: string;
  size: number;
  bloomDelayMs: number;
  swayDurSec: number;
};

function generateFlowers(centerX: number, centerY: number): Flower[] {
  const count = 7 + Math.floor(Math.random() * 3);
  const flowers: Flower[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const radius = 62 + Math.random() * 32;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius * 0.55; // flatten vertically → ground plane
    const size = 18 + Math.random() * 12;
    flowers.push({
      id: i,
      left: centerX + dx - size / 2,
      top: centerY + dy - size / 2,
      emoji: FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)]!,
      size,
      bloomDelayMs: Math.floor(Math.random() * 800),
      swayDurSec: 1.8 + Math.random() * 1.4,
    });
  }
  return flowers;
}

interface PicnicProps {
  centerX: number;
  centerY: number;
  onEnd: () => void;
  durationMs?: number;
}

export function Picnic({
  centerX,
  centerY,
  onEnd,
  durationMs = 10_000,
}: PicnicProps) {
  const flowers = useMemo(
    () => generateFlowers(centerX, centerY),
    [centerX, centerY],
  );

  useEffect(() => {
    const t = setTimeout(onEnd, durationMs);
    return () => clearTimeout(t);
  }, [onEnd, durationMs]);

  const durationVar = { "--vi-flower-duration": `${durationMs}ms` } as React.CSSProperties;

  return (
    <>
      {/* Picnic blanket — soft pink ground glow */}
      <div
        aria-hidden
        className="fixed z-40 pointer-events-none animate-vi-blanket"
        style={{
          left: centerX - 90,
          top: centerY - 8,
          width: 180,
          height: 50,
          background:
            "radial-gradient(ellipse at center, rgba(245, 194, 231, 0.55), rgba(245, 194, 231, 0) 70%)",
          ...durationVar,
        }}
      />

      {/* Flowers */}
      {flowers.map((f) => (
        <div
          key={f.id}
          aria-hidden
          className="fixed z-40 pointer-events-none select-none animate-vi-flower"
          style={
            {
              left: f.left,
              top: f.top,
              fontSize: f.size,
              lineHeight: 1,
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
              ...durationVar,
              animationDelay: `${f.bloomDelayMs}ms`,
            } as React.CSSProperties
          }
        >
          <span
            className="vi-flower-sway"
            style={
              {
                "--vi-sway-duration": `${f.swayDurSec}s`,
                animationDelay: `${f.bloomDelayMs / 2}ms`,
              } as React.CSSProperties
            }
          >
            {f.emoji}
          </span>
        </div>
      ))}

      {/* Picnic basket next to character */}
      <div
        aria-hidden
        className="fixed z-40 pointer-events-none select-none animate-vi-flower"
        style={
          {
            left: centerX + 40,
            top: centerY - 6,
            fontSize: 26,
            lineHeight: 1,
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
            ...durationVar,
            animationDelay: "150ms",
          } as React.CSSProperties
        }
      >
        🧺
      </div>
    </>
  );
}
