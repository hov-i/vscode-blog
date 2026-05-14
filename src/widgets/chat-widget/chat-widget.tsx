"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { ChatAvatar } from "./avatar";
import { ChatBubble } from "./chat-bubble";
import {
  Butterfly,
  butterflyPosAt,
  randomButterflyColor,
  type ButterflyData,
} from "./butterfly";
import { Picnic } from "./picnic";
import { SpeechBubble } from "./speech-bubble";
import { useChat } from "./use-chat";
import {
  getBaselineMood,
  getTimeOfDay,
  pickEventQuip,
  pickIdleQuip,
  pickPathQuip,
  type Quip,
} from "./quips";
import type { AvatarMood } from "./types";

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const BUTTON_SIZE = 64;
const EDGE_MARGIN = 12;
const POS_KEY = "vi-widget-pos-v1";
const DRAG_THRESHOLD_PX = 4;

const DROP_ZONE_SIZE = 64;
const DROP_ZONE_TOP = 16;

const WANDER_MIN_MS = 11_000;
const WANDER_MAX_MS = 20_000;

const MOOD_TICK_MIN_MS = 2500;
const MOOD_TICK_MAX_MS = 5500;
const MOOD_SHOW_MIN_MS = 1300;
const MOOD_SHOW_MAX_MS = 2400;
const MOOD_CHANGE_PROB = 0.8;

const BUTTERFLY_SPAWN_MIN_MS = 22_000;
const BUTTERFLY_SPAWN_MAX_MS = 55_000;

const PICNIC_SPAWN_MIN_MS = 25_000;
const PICNIC_SPAWN_MAX_MS = 55_000;
const PICNIC_DURATION_MS = 11_000;
const PICNIC_MID_QUIP_MS = 4_500;
const PICNIC_CHILL_MOODS: AvatarMood[] = ["love", "sleepy", "happy", "love"];

const ORBIT_TRIGGER_MIN_MS = 28_000;
const ORBIT_TRIGGER_MAX_MS = 60_000;
const ORBIT_DURATION_MS = 5_000;

const HOVER_LINK_DELAY_MS = 350;
const HOVER_CODE_DELAY_MS = 550;

const IDLE_QUIP_MIN_MS = 24_000;
const IDLE_QUIP_MAX_MS = 55_000;

const QUIP_DEFAULT_MS = 3800;

const ALL_IDLE_MOODS: AvatarMood[] = [
  "wink",
  "nod",
  "happy",
  "love",
  "sleepy",
  "confused",
];

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
type Pos = { x: number; y: number };
type FSMKind =
  | "wander"
  | "chasing"
  | "orbiting"
  | "peeking"
  | "reading"
  | "picnic"
  | "chatting";

type PicnicData = { id: number; centerX: number; centerY: number };

type ActiveQuip = { id: number; text: string };

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function clampToViewport(p: Pos): Pos {
  if (typeof window === "undefined") return p;
  return {
    x: clamp(p.x, EDGE_MARGIN, window.innerWidth - BUTTON_SIZE - EDGE_MARGIN),
    y: clamp(p.y, EDGE_MARGIN, window.innerHeight - BUTTON_SIZE - EDGE_MARGIN),
  };
}
function isOverDropZone(p: Pos): boolean {
  if (typeof window === "undefined") return false;
  const cx = p.x + BUTTON_SIZE / 2;
  const cy = p.y + BUTTON_SIZE / 2;
  const left = (window.innerWidth - DROP_ZONE_SIZE) / 2;
  return (
    cx >= left &&
    cx <= left + DROP_ZONE_SIZE &&
    cy >= DROP_ZONE_TOP &&
    cy <= DROP_ZONE_TOP + DROP_ZONE_SIZE
  );
}
function defaultPos(): Pos {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: window.innerWidth - BUTTON_SIZE - 24,
    y: window.innerHeight - BUTTON_SIZE - 24,
  };
}
function loadPos(): Pos | null {
  try {
    const raw = window.localStorage.getItem(POS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
      return clampToViewport(parsed);
    }
    return null;
  } catch {
    return null;
  }
}
function savePos(p: Pos) {
  try {
    window.localStorage.setItem(POS_KEY, JSON.stringify(p));
  } catch {
    // ignore quota
  }
}
function targetBelowRect(rect: DOMRect): Pos {
  return clampToViewport({
    x: rect.right - BUTTON_SIZE / 2,
    y: rect.bottom + 4,
  });
}
function targetAtCodeCorner(rect: DOMRect): Pos {
  return clampToViewport({
    x: rect.right - BUTTON_SIZE + 8,
    y: rect.top - BUTTON_SIZE / 2,
  });
}
function targetOrbitingCursor(cursor: Pos, startedAt: number): Pos {
  const radius = 100;
  const angle = ((Date.now() - startedAt) / 1400) % (Math.PI * 2);
  return clampToViewport({
    x: cursor.x + Math.cos(angle) * radius - BUTTON_SIZE / 2,
    y: cursor.y + Math.sin(angle) * radius * 0.7 - BUTTON_SIZE / 2,
  });
}
function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// Pick a mood different from the previous one, with baseline bias
function pickNextMood(prev: AvatarMood, baseline: AvatarMood): AvatarMood {
  if (Math.random() < 0.35 && baseline !== prev) return baseline;
  const pool = ALL_IDLE_MOODS.filter((m) => m !== prev);
  return pool[Math.floor(Math.random() * pool.length)]!;
}

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────
export function ChatWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [mood, setMood] = useState<AvatarMood>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [fsm, setFsm] = useState<FSMKind>("wander");
  const [butterfly, setButterfly] = useState<ButterflyData | null>(null);
  const [picnic, setPicnic] = useState<PicnicData | null>(null);
  const [wiggleKey, setWiggleKey] = useState(0);
  const [activeQuip, setActiveQuip] = useState<ActiveQuip | null>(null);
  const [hidden, setHidden] = useState(false);
  const [overDropZone, setOverDropZone] = useState(false);

  const {
    messages: chatMessages,
    state: chatState,
    send: chatSend,
    reset: chatReset,
  } = useChat();

  // Refs
  const dragRef = useRef<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    moved: boolean;
  } | null>(null);
  const posRef = useRef(pos);
  const moodRef = useRef<AvatarMood>(mood);
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorRef = useRef<Pos>({ x: 0, y: 0 });
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentHoverElRef = useRef<HTMLElement | null>(null);
  const orbitStartRef = useRef<number>(0);
  const quipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialPathRef = useRef(true);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);
  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPos(loadPos() ?? defaultPos());
    setMounted(true);
  }, []);

  useEffect(() => {
    const onResize = () => setPos((p) => clampToViewport(p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ────────────────────────────
  // Show a speech bubble (with optional mood override)
  // ────────────────────────────
  const showQuip = useCallback((quip: Quip | undefined) => {
    if (!quip) return;
    const id = Date.now() + Math.random();
    setActiveQuip({ id, text: quip.text });
    if (quip.mood) setMood(quip.mood);
    if (quipTimerRef.current) clearTimeout(quipTimerRef.current);
    quipTimerRef.current = setTimeout(() => {
      setActiveQuip((prev) => (prev?.id === id ? null : prev));
    }, quip.duration ?? QUIP_DEFAULT_MS);
  }, []);

  // ────────────────────────────
  // Pointer tracking + hover detection
  // ────────────────────────────
  useEffect(() => {
    if (open || isDragging) return;

    const onMove = (e: PointerEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (currentHoverElRef.current?.contains(target)) return;

      const code = target.closest("pre, pre code") as HTMLElement | null;
      if (code) {
        currentHoverElRef.current = code;
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(() => {
          const el = currentHoverElRef.current;
          if (!el || !document.body.contains(el)) return;
          const rect = el.getBoundingClientRect();
          setFsm("reading");
          setPos(targetAtCodeCorner(rect));
          showQuip(pickEventQuip("codeRead"));
        }, HOVER_CODE_DELAY_MS);
        return;
      }
      const link = target.closest("a[href]") as HTMLElement | null;
      if (link) {
        currentHoverElRef.current = link;
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(() => {
          const el = currentHoverElRef.current;
          if (!el || !document.body.contains(el)) return;
          const rect = el.getBoundingClientRect();
          setFsm("peeking");
          setPos(targetBelowRect(rect));
          showQuip(pickEventQuip("linkPeek"));
        }, HOVER_LINK_DELAY_MS);
      }
    };

    const onOut = (e: PointerEvent) => {
      const related = e.relatedTarget as Node | null;
      const current = currentHoverElRef.current;
      if (!current) return;
      if (related && current.contains(related)) return;
      currentHoverElRef.current = null;
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setFsm((prev) =>
        prev === "peeking" || prev === "reading" ? "wander" : prev,
      );
    };

    const onScrollOrResize = () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      currentHoverElRef.current = null;
      setFsm((prev) =>
        prev === "peeking" || prev === "reading" ? "wander" : prev,
      );
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("scroll", onScrollOrResize, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("scroll", onScrollOrResize);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [open, isDragging, showQuip]);

  // ────────────────────────────
  // Mood cycling (during wander): time-biased, no repeats
  // ────────────────────────────
  useEffect(() => {
    if (open || isDragging || fsm !== "wander") return;
    let cancelled = false;

    const schedule = () => {
      const delay = randomInRange(MOOD_TICK_MIN_MS, MOOD_TICK_MAX_MS);
      moodTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        const baseline = getBaselineMood(getTimeOfDay());
        if (Math.random() < MOOD_CHANGE_PROB) {
          const m = pickNextMood(moodRef.current, baseline);
          setMood(m);
          moodTimerRef.current = setTimeout(() => {
            if (!cancelled) {
              setMood(baseline === "idle" ? "idle" : baseline);
              schedule();
            }
          }, randomInRange(MOOD_SHOW_MIN_MS, MOOD_SHOW_MAX_MS));
        } else {
          setMood(baseline);
          schedule();
        }
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    };
  }, [open, isDragging, fsm]);

  // ────────────────────────────
  // Autonomous wandering
  // ────────────────────────────
  useEffect(() => {
    if (open || isDragging || fsm !== "wander") return;
    const tick = () => {
      setPos((p) => {
        const dx = (Math.random() - 0.5) * 160;
        const dy = (Math.random() - 0.5) * 110;
        const next = clampToViewport({ x: p.x + dx, y: p.y + dy });
        savePos(next);
        return next;
      });
      setWiggleKey((k) => k + 1);
    };
    const timer = setInterval(
      tick,
      randomInRange(WANDER_MIN_MS, WANDER_MAX_MS),
    );
    return () => clearInterval(timer);
  }, [open, isDragging, fsm]);

  // ────────────────────────────
  // Random idle quips (during wander)
  // ────────────────────────────
  useEffect(() => {
    if (open || isDragging || fsm !== "wander") return;
    const delay = randomInRange(IDLE_QUIP_MIN_MS, IDLE_QUIP_MAX_MS);
    const timer = setTimeout(() => {
      showQuip(pickIdleQuip(pathname));
    }, delay);
    return () => clearTimeout(timer);
  }, [open, isDragging, fsm, pathname, activeQuip, showQuip]);

  // ────────────────────────────
  // Page navigation → path quip (skip initial mount to avoid double-show with butterfly)
  // ────────────────────────────
  useEffect(() => {
    if (open) return;
    if (isInitialPathRef.current) {
      isInitialPathRef.current = false;
      // Still greet on the very first page
      const t = setTimeout(() => showQuip(pickPathQuip(pathname)), 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => showQuip(pickPathQuip(pathname)), 1200);
    return () => clearTimeout(t);
  }, [pathname, open, showQuip]);

  // ────────────────────────────
  // Butterfly spawn scheduler
  // ────────────────────────────
  useEffect(() => {
    if (open || isDragging || fsm !== "wander" || butterfly) return;
    const delay = randomInRange(BUTTERFLY_SPAWN_MIN_MS, BUTTERFLY_SPAWN_MAX_MS);
    const timer = setTimeout(() => {
      if (typeof window === "undefined") return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fromLeft = Math.random() < 0.5;
      const startX = fromLeft ? -40 : vw + 40;
      const endX = fromLeft ? vw + 40 : -40;
      // Keep butterflies in the upper band of the viewport so the character
      // naturally chases from below.
      const topBand = 60;
      const bottomBand = Math.max(topBand + 80, vh * 0.45);
      const startY = randomInRange(topBand, bottomBand);
      const endY = randomInRange(topBand, bottomBand);
      setButterfly({
        id: Date.now(),
        startTime: Date.now(),
        duration: randomInRange(7500, 11500),
        pathStart: { x: startX, y: startY },
        pathEnd: { x: endX, y: endY },
        waveAmp: randomInRange(30, 60),
        waveFreq: randomInRange(3.5, 6),
        color: randomButterflyColor(),
      });
      setFsm("chasing");
      showQuip(pickEventQuip("butterflySpawn"));
    }, delay);
    return () => clearTimeout(timer);
  }, [open, isDragging, fsm, butterfly, showQuip]);

  // ────────────────────────────
  // Chasing: follow butterfly
  // ────────────────────────────
  useEffect(() => {
    if (!butterfly || fsm !== "chasing") return;
    const tick = setInterval(() => {
      const p = butterflyPosAt(butterfly, Date.now());
      if (p.t >= 1) return;
      setPos(
        clampToViewport({
          x: p.x - BUTTON_SIZE / 2 - 8,
          y: p.y + 90,
        }),
      );
    }, 320);
    return () => clearInterval(tick);
  }, [butterfly, fsm]);

  const onButterflyEnd = useCallback(() => {
    setButterfly(null);
    setFsm("wander");
    showQuip(pickEventQuip("butterflyLost"));
  }, [showQuip]);

  // ────────────────────────────
  // Picnic spawn scheduler
  // ────────────────────────────
  useEffect(() => {
    if (open || isDragging || fsm !== "wander" || butterfly || picnic) return;
    const delay = randomInRange(PICNIC_SPAWN_MIN_MS, PICNIC_SPAWN_MAX_MS);
    const timer = setTimeout(() => {
      const p = posRef.current;
      setPicnic({
        id: Date.now(),
        centerX: p.x + BUTTON_SIZE / 2,
        centerY: p.y + BUTTON_SIZE - 4,
      });
      setFsm("picnic");
      showQuip(pickEventQuip("picnicStart"));
    }, delay);
    return () => clearTimeout(timer);
  }, [open, isDragging, fsm, butterfly, picnic, showQuip]);

  // Picnic chill mood cycle
  useEffect(() => {
    if (fsm !== "picnic") return;
    let i = 0;
    const tick = setInterval(() => {
      setMood(PICNIC_CHILL_MOODS[i % PICNIC_CHILL_MOODS.length]!);
      i += 1;
    }, 2200);
    return () => clearInterval(tick);
  }, [fsm]);

  // Picnic mid-quip (one mid-session line)
  useEffect(() => {
    if (fsm !== "picnic") return;
    const t = setTimeout(() => {
      showQuip(pickEventQuip("picnicMid"));
    }, PICNIC_MID_QUIP_MS);
    return () => clearTimeout(t);
  }, [fsm, showQuip]);

  const onPicnicEnd = useCallback(() => {
    setPicnic(null);
    setFsm("wander");
    showQuip(pickEventQuip("picnicEnd"));
  }, [showQuip]);

  // ────────────────────────────
  // Cursor orbit
  // ────────────────────────────
  useEffect(() => {
    if (open || isDragging || fsm !== "wander") return;
    const delay = randomInRange(ORBIT_TRIGGER_MIN_MS, ORBIT_TRIGGER_MAX_MS);
    const triggerTimer = setTimeout(() => {
      const c = cursorRef.current;
      if (
        c.x < 60 ||
        c.y < 60 ||
        c.x > window.innerWidth - 60 ||
        c.y > window.innerHeight - 60
      ) {
        return;
      }
      orbitStartRef.current = Date.now();
      setFsm("orbiting");
      showQuip(pickEventQuip("orbit"));
    }, delay);
    return () => clearTimeout(triggerTimer);
  }, [open, isDragging, fsm, showQuip]);

  useEffect(() => {
    if (fsm !== "orbiting") return;
    const started = orbitStartRef.current;
    const tick = setInterval(() => {
      if (Date.now() - started >= ORBIT_DURATION_MS) {
        setFsm("wander");
        setMood("idle");
        return;
      }
      setPos(targetOrbitingCursor(cursorRef.current, started));
    }, 200);
    return () => clearInterval(tick);
  }, [fsm]);

  // ────────────────────────────
  // Cancel ambient on drag/open; set FSM to chatting when open
  // ────────────────────────────
  useEffect(() => {
    if (!open && !isDragging) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFsm(open ? "chatting" : "wander");
    setButterfly(null);
    setPicnic(null);
    if (open) setActiveQuip(null);
  }, [open, isDragging]);

  // ────────────────────────────
  // Sync character mood to chat state while chatting
  // ────────────────────────────
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMood(chatState);
  }, [open, chatState]);

  // ────────────────────────────
  // Drag handlers
  // ────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - posRef.current.x,
        offsetY: e.clientY - posRef.current.y,
        moved: false,
      };
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = Math.abs(e.clientX - d.startX);
      const dy = Math.abs(e.clientY - d.startY);
      if (!d.moved && (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX)) {
        d.moved = true;
        setIsDragging(true);
        showQuip(pickEventQuip("drag"));
      }
      if (d.moved) {
        const next = clampToViewport({
          x: e.clientX - d.offsetX,
          y: e.clientY - d.offsetY,
        });
        setPos(next);
        setOverDropZone(isOverDropZone(next));
      }
    },
    [showQuip],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // capture may already be lost
      }
      const d = dragRef.current;
      dragRef.current = null;
      if (d && !d.moved) {
        setOpen(true);
        showQuip(pickEventQuip("openChat"));
      } else if (d?.moved) {
        if (isOverDropZone(posRef.current)) {
          setHidden(true);
        } else {
          savePos(posRef.current);
        }
      }
      setIsDragging(false);
      setOverDropZone(false);
    },
    [showQuip],
  );

  // ────────────────────────────
  // Render
  // ────────────────────────────
  if (pathname?.startsWith("/admin")) return null;
  if (!mounted) return null;
  if (hidden) return null;

  const transitionCss = isDragging
    ? "none"
    : fsm === "chasing"
      ? "left 0.38s ease-out, top 0.38s ease-out"
      : fsm === "orbiting"
        ? "left 0.22s linear, top 0.22s linear"
        : fsm === "peeking" || fsm === "reading"
          ? "left 0.55s cubic-bezier(0.22, 1, 0.36, 1), top 0.55s cubic-bezier(0.22, 1, 0.36, 1)"
          : "left 1.6s cubic-bezier(0.22, 1, 0.36, 1), top 1.6s cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <>
      {isDragging && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: "50%",
            top: DROP_ZONE_TOP,
            width: DROP_ZONE_SIZE,
            height: DROP_ZONE_SIZE,
            transform: "translateX(-50%)",
          }}
          className={cn(
            "z-50 flex items-center justify-center rounded-full",
            "backdrop-blur-sm transition-all duration-200 pointer-events-none",
            overDropZone
              ? "scale-110 bg-red-500/40 text-red-50"
              : "bg-black/30 text-white/70",
          )}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </div>
      )}
      {butterfly && (
        <Butterfly butterfly={butterfly} onEnd={onButterflyEnd} />
      )}
      {picnic && (
        <Picnic
          key={picnic.id}
          centerX={picnic.centerX}
          centerY={picnic.centerY}
          onEnd={onPicnicEnd}
          durationMs={PICNIC_DURATION_MS}
        />
      )}
      {!open && activeQuip && (
        <SpeechBubble
          key={activeQuip.id}
          text={activeQuip.text}
          anchorX={pos.x}
          anchorY={pos.y}
          buttonSize={BUTTON_SIZE}
          followTransition={transitionCss}
        />
      )}
      {open && (
        <ChatBubble
          anchorX={pos.x}
          anchorY={pos.y}
          buttonSize={BUTTON_SIZE}
          messages={chatMessages}
          state={chatState}
          onSend={chatSend}
          onReset={chatReset}
          onClose={() => setOpen(false)}
        />
      )}
      <button
        type="button"
        aria-label="v_i 챗봇 열기 (드래그해서 옮길 수도 있어요)"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          transition: transitionCss,
        }}
        className={cn(
          "z-50 select-none",
          "bg-transparent border-0 p-0",
          "hover:scale-110 active:scale-95",
          !isDragging && fsm === "wander" && "animate-vi-float",
        )}
      >
        <span
          key={wiggleKey}
          className={cn(
            "block w-full h-full rounded-md overflow-hidden",
            "shadow-[0_10px_18px_-6px_rgba(0,0,0,0.5),0_4px_6px_-2px_rgba(0,0,0,0.3)]",
            !isDragging && wiggleKey > 0 && fsm === "wander" && "animate-vi-wiggle",
          )}
        >
          <ChatAvatar
            state={mood}
            size={BUTTON_SIZE}
            className="rounded-md pointer-events-none w-full h-full"
          />
        </span>
      </button>
    </>
  );
}
