"use client";

import { useEffect, useRef } from "react";

export const BUTTERFLY_COLORS = [
  "blue",
  "pink",
  "mauve",
  "yellow",
  "green",
  "teal",
] as const;
export type ButterflyColor = (typeof BUTTERFLY_COLORS)[number];

export function randomButterflyColor(): ButterflyColor {
  return BUTTERFLY_COLORS[
    Math.floor(Math.random() * BUTTERFLY_COLORS.length)
  ]!;
}

export type ButterflyData = {
  id: number;
  startTime: number;
  duration: number;
  pathStart: { x: number; y: number };
  pathEnd: { x: number; y: number };
  waveAmp: number;
  waveFreq: number;
  color: ButterflyColor;
};

export function butterflyPosAt(b: ButterflyData, now: number) {
  const t = Math.min(1, Math.max(0, (now - b.startTime) / b.duration));
  const x = b.pathStart.x + (b.pathEnd.x - b.pathStart.x) * t;
  const yBase = b.pathStart.y + (b.pathEnd.y - b.pathStart.y) * t;
  const y = yBase + Math.sin(t * Math.PI * b.waveFreq) * b.waveAmp;
  return { x, y, t };
}

const BUTTERFLY_SIZE = 36;

interface ButterflyProps {
  butterfly: ButterflyData;
  onEnd: () => void;
}

export function Butterfly({ butterfly, onEnd }: ButterflyProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const now = Date.now();
      const p = butterflyPosAt(butterfly, now);
      if (p.t >= 1) {
        onEnd();
        return;
      }
      if (ref.current) {
        const wobble = Math.sin(p.t * Math.PI * butterfly.waveFreq) * 10;
        const dir = butterfly.pathEnd.x >= butterfly.pathStart.x ? 1 : -1;
        ref.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scaleX(${dir}) rotate(${wobble}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [butterfly, onEnd]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed top-0 left-0 z-40 pointer-events-none select-none will-change-transform"
      style={{
        transform: `translate3d(${butterfly.pathStart.x}px, ${butterfly.pathStart.y}px, 0)`,
        width: BUTTERFLY_SIZE,
        height: BUTTERFLY_SIZE,
        lineHeight: 0,
        filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.25))",
      }}
    >
      {/* Using <img> (not next/image) because: pixel-art assets with image-rendering: pixelated,
          and Next's optimizer would re-encode and blur the crisp edges. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/butterflies/butterfly-${butterfly.color}.gif`}
        alt=""
        width={BUTTERFLY_SIZE}
        height={BUTTERFLY_SIZE}
        style={{
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
        }}
        draggable={false}
      />
    </div>
  );
}
