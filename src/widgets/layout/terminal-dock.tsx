"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ZOOM_SCALE } from "@/shared/lib/ui/zoom-scale";

const UI_FONT = "'Segoe UI Variable','Segoe UI',system-ui,sans-serif";
const MONO_FONT = "Consolas,'Cascadia Mono',Menlo,monospace";

const TABS = ["Problems", "Output", "Debug Console", "Terminal", "Ports"] as const;
type Tab = (typeof TABS)[number];

const EMPTY_STATE: Record<Exclude<Tab, "Terminal">, string> = {
  Problems: "No problems have been detected in the workspace so far.",
  Output: "[info] Nothing to show yet.",
  "Debug Console": "No debug session started.",
  Ports: "No forwarded ports. Forward a port to access your running services.",
};

const MAX_INPUT_LENGTH = 2000;

const DEFAULT_TERMINAL_HEIGHT = 260;
const MIN_TERMINAL_HEIGHT = 140;
const MAX_TERMINAL_HEIGHT_RATIO = 0.7;

// Session banner — mascot art is a rasterized PNG (not live Unicode block
// glyphs) so it renders identically regardless of the visitor's font/OS.
const BANNER_TEXT_LINES = [
  [
    { text: "Claude Code", color: "#FFFFFF", bold: true },
    { text: " v2.1.250", color: "rgb(196,196,196)" },
  ],
  [{ text: "Sonnet 5 · Claude Max", color: "rgb(196,196,196)" }],
  [{ text: "/Volumes/Extreme SSD/Projects/studyProject/vscode-blog", color: "rgb(196,196,196)" }],
];

type BootStage = "shell" | "banner" | "initTyping" | "initResult" | "ready";
const STAGE_ORDER: BootStage[] = ["shell", "banner", "initTyping", "initResult", "ready"];
const SHELL_LABEL = "hov_i";
const SHELL_BRANCH = "main";
const SHELL_CMD = "claude";
const INIT_CMD = "/init";
const BOOT_PLAYED_KEY = "terminal-boot-played";

function hasBootPlayed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(BOOT_PLAYED_KEY) === "1";
  } catch {
    return false;
  }
}

type ChatMessage = { role: "user" | "assistant"; content: string };

type StreamEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: string }
  | { type: "error"; message: string }
  | { type: "done" };

// Literal "terminal — Claude Code CLI session" from design.html section 06.
export function TerminalDock() {
  const [tab, setTab] = useState<Tab>("Terminal");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [pending, setPending] = useState(false);
  const [pendingTool, setPendingTool] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [height, setHeight] = useState(DEFAULT_TERMINAL_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  // Always starts at "shell" so server and client render the same markup on
  // first paint; the layout effect below jumps straight to "ready" pre-paint
  // when sessionStorage says the boot animation already played this session.
  const [bootStage, setBootStage] = useState<BootStage>("shell");
  const [shellTyped, setShellTyped] = useState("");
  const [initTyped, setInitTyped] = useState("");
  const skipBootRef = useRef(false);

  useLayoutEffect(() => {
    if (hasBootPlayed()) {
      skipBootRef.current = true;
      setBootStage("ready");
    }
  }, []);
  const stageIndex = STAGE_ORDER.indexOf(bootStage);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const syncCursor = (e: { currentTarget: HTMLInputElement }) => {
    setCursorPos(e.currentTarget.selectionStart ?? e.currentTarget.value.length);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, streamingText, pendingTool, errorMsg]);

  // Boot animation — types "claude", reveals the banner, then types "/init".
  // Plays once per browser session; later mounts (route changes, remounts)
  // start straight at "ready" via the sessionStorage flag above.
  useEffect(() => {
    if (skipBootRef.current) return;

    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    async function playBoot() {
      for (let i = 1; i <= SHELL_CMD.length; i++) {
        if (cancelled) return;
        setShellTyped(SHELL_CMD.slice(0, i));
        await sleep(70);
      }
      await sleep(350);
      if (cancelled) return;
      setBootStage("banner");

      await sleep(550);
      if (cancelled) return;
      setBootStage("initTyping");
      for (let i = 1; i <= INIT_CMD.length; i++) {
        if (cancelled) return;
        setInitTyped(INIT_CMD.slice(0, i));
        await sleep(65);
      }

      await sleep(400);
      if (cancelled) return;
      setBootStage("initResult");

      await sleep(650);
      if (cancelled) return;
      setBootStage("ready");
      try {
        sessionStorage.setItem(BOOT_PLAYED_KEY, "1");
      } catch {
        // storage unavailable (private mode etc.) — animation just replays next mount
      }
    }

    playBoot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (bootStage === "ready") inputRef.current?.focus();
  }, [bootStage]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragRef.current) return;
      const { startY, startHeight } = dragRef.current;
      const maxHeight = (window.innerHeight * MAX_TERMINAL_HEIGHT_RATIO) / ZOOM_SCALE;
      const deltaY = (e.clientY - startY) / ZOOM_SCALE;
      const next = Math.min(maxHeight, Math.max(MIN_TERMINAL_HEIGHT, startHeight - deltaY));
      setHeight(next);
    }
    function handleMouseUp() {
      dragRef.current = null;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  function handleResizeStart(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startHeight: height };
    setIsResizing(true);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }

  async function handleSubmit() {
    const text = input.trim();
    if (!text || pending) return;

    const nextHistory: ChatMessage[] = [...history, { role: "user", content: text }];
    setHistory(nextHistory);
    setInput("");
    setCursorPos(0);
    setErrorMsg(null);
    setPendingTool(null);
    setStreamingText("");
    setPending(true);

    let assistantText = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        if (res.status === 429 && data?.retryAfterSec) {
          setErrorMsg(`요청이 너무 많아요. ${data.retryAfterSec}초 후 다시 시도해줘.`);
        } else {
          setErrorMsg(data?.error ?? "요청에 실패했어요.");
        }
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as StreamEvent;

          if (event.type === "tool") {
            setPendingTool(event.name);
          } else if (event.type === "text") {
            setPendingTool(null);
            assistantText += event.text;
            setStreamingText(assistantText);
          } else if (event.type === "error") {
            setErrorMsg(event.message);
          }
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "네트워크 오류가 발생했어요.");
    } finally {
      if (assistantText.trim()) {
        setHistory((h) => [...h, { role: "assistant", content: assistantText }]);
      }
      setStreamingText("");
      setPendingTool(null);
      setPending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div style={{ flex: "none", height, position: "relative", borderRadius: 7, background: "rgba(40,40,40,.75)", border: "1px solid rgba(255,255,255,.12)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div
        className={`terminal-resize-handle${isResizing ? " dragging" : ""}`}
        onMouseDown={handleResizeStart}
        style={{ position: "absolute", top: -5, left: 0, right: 0, height: 9, cursor: "row-resize", zIndex: 10 }}
      />
      <div style={{ height: 28, flex: "none", display: "flex", alignItems: "center", gap: 2, padding: "0 8px" }}>
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                height: 24,
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                borderRadius: 4,
                background: active ? "rgba(255,255,255,.0605)" : "transparent",
                border: active ? "1px solid rgba(255,255,255,.0605)" : "1px solid transparent",
                font: `400 12px/12px ${UI_FONT}`,
                color: active ? "#FFFFFF" : "rgb(196,196,196)",
                whiteSpace: "nowrap",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab !== "Terminal" ? (
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <p style={{ font: `400 12px/1.4 ${MONO_FONT}`, color: "rgb(196,196,196)", textAlign: "center" }}>{EMPTY_STATE[tab]}</p>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, padding: "6px 14px 4px", display: "flex", flexDirection: "column", fontFamily: MONO_FONT, fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "rgb(196,196,196)" }}>
          <div style={{ flex: "none", height: 18, whiteSpace: "pre" }}>
            <span style={{ color: "rgb(196,196,196)" }}>○ </span>
            <span style={{ color: "#E5A13A" }}>{SHELL_LABEL}</span>
            <span style={{ color: "rgb(196,196,196)" }}> [</span>
            <span style={{ color: "rgb(83,214,128)" }}>{SHELL_BRANCH}</span>
            <span style={{ color: "rgb(196,196,196)" }}>] ⚡ </span>
            <span style={{ color: "#FFFFFF" }}>{shellTyped}</span>
            {bootStage === "shell" && <span className="terminal-block-cursor">{" "}</span>}
          </div>

          {stageIndex >= 1 && (
            <div style={{ flex: "none", display: "flex", alignItems: "flex-start", gap: 12, marginTop: 10, padding: "2px 0 0 2px" }}>
              <img src="/icons/claude-mascot.png" alt="" style={{ flex: "none", width: 69, height: 46, display: "block", imageRendering: "pixelated", marginTop: 10 }} />
              <div style={{ flex: "none", fontFamily: MONO_FONT, fontWeight: 400, fontSize: 13, lineHeight: "18px" }}>
                {BANNER_TEXT_LINES.map((segs, i) => (
                  <div key={i} style={{ height: 18, whiteSpace: "pre" }}>
                    {segs.map((s, j) => (
                      <span key={j} style={{ color: s.color, fontWeight: s.bold ? 700 : 400 }}>
                        {s.text}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {stageIndex >= 2 && (
            <div style={{ flex: "none", marginTop: 10 }}>
              <div style={{ height: 18, whiteSpace: "pre" }}>
                <span style={{ color: "rgb(196,196,196)" }}>❯ </span>
                <span style={{ color: "#FFFFFF" }}>{bootStage === "initTyping" ? initTyped : INIT_CMD}</span>
                {bootStage === "initTyping" && <span className="terminal-block-cursor">{" "}</span>}
              </div>
              {stageIndex >= 3 && (
                <div style={{ height: 18, whiteSpace: "pre", paddingLeft: 14 }}>
                  <span style={{ color: "rgba(249,249,249,.5)" }}>└ </span>
                  <span style={{ color: "rgb(83,214,128)" }}>✓ </span>
                  <span style={{ color: "rgb(196,196,196)" }}>Portfolio loaded. Ready to explore hov_i&apos;s work.</span>
                </div>
              )}
            </div>
          )}

          {stageIndex >= 4 && (
          <>
          <div style={{ flex: "none", height: 1, margin: "6px 0 0", background: "rgba(249,249,249,.1)" }} />

          {/* Scrolling chat transcript */}
          <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, padding: "6px 0" }}>
            {history.map((m, i) =>
              m.role === "user" ? (
                <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  <span style={{ color: "rgb(196,196,196)" }}>❯ </span>
                  <span style={{ color: "#FFFFFF" }}>{m.content}</span>
                </div>
              ) : (
                <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", paddingLeft: 14, color: "rgb(196,196,196)" }}>
                  {m.content}
                </div>
              ),
            )}

            {pendingTool && (
              <div style={{ whiteSpace: "pre-wrap", paddingLeft: 14 }}>
                <span style={{ color: "rgba(249,249,249,.5)" }}>└ </span>
                <span className="animate-pulse" style={{ color: "#E5A13A" }}>🔍 {pendingTool} 검색 중...</span>
              </div>
            )}

            {streamingText && (
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", paddingLeft: 14, color: "rgb(196,196,196)" }}>
                {streamingText}
              </div>
            )}

            {pending && !pendingTool && !streamingText && (
              <div style={{ paddingLeft: 14 }}>
                <span className="animate-pulse" style={{ color: "rgb(196,196,196)" }}>●</span>
              </div>
            )}

            {errorMsg && (
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                <span style={{ color: "#E5484D" }}>⚠ {errorMsg}</span>
              </div>
            )}
          </div>

          <div style={{ flex: "none", height: 1, background: "rgba(249,249,249,.1)" }} />

          <div
            style={{ flex: "none", height: 24, display: "flex", alignItems: "center", gap: 8, position: "relative" }}
            onClick={() => inputRef.current?.focus()}
          >
            <span style={{ color: "rgb(196,196,196)" }}>❯</span>

            {/* Visible rendered text + terminal block cursor */}
            <div style={{ flex: 1, minWidth: 0, whiteSpace: "pre", overflow: "hidden" }}>
              {input.length === 0 ? (
                <>
                  <span className="terminal-block-cursor">{" "}</span>
                  <span style={{ color: "rgba(249,249,249,.5)" }}>hov_i에 대해 물어보세요...</span>
                </>
              ) : (
                <>
                  <span style={{ color: "#FFFFFF" }}>{input.slice(0, cursorPos)}</span>
                  <span className="terminal-block-cursor">{input.charAt(cursorPos) || " "}</span>
                  <span style={{ color: "#FFFFFF" }}>{input.slice(cursorPos + 1)}</span>
                </>
              )}
            </div>

            {/* Invisible real input — captures typing/IME, drives the rendered text above */}
            <input
              ref={inputRef}
              value={input}
              maxLength={MAX_INPUT_LENGTH}
              onChange={(e) => {
                setInput(e.target.value);
                syncCursor(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              onKeyUp={syncCursor}
              onClick={syncCursor}
              onSelect={syncCursor}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                padding: 0,
                margin: 0,
                caretColor: "transparent",
                color: "transparent",
                fontFamily: MONO_FONT,
                fontWeight: 400,
                fontSize: 13,
                lineHeight: "18px",
              }}
            />
          </div>

          <div style={{ flex: "none", height: 1, background: "rgba(249,249,249,.1)" }} />

          <div style={{ flex: "none", marginTop: 4, display: "flex", alignItems: "flex-start", gap: 16, paddingLeft: 14 }}>
            <div style={{ height: 18, whiteSpace: "pre", flex: 1, minWidth: 0 }}>
              <span style={{ color: "#E5A13A" }}>▸▸ auto mode on</span>
              <span style={{ color: "rgb(196,196,196)" }}> (shift+tab to cycle) · ↵ for agents</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: "none" }}>
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgb(83,214,128)" }}>/rc active</span></div>
            </div>
          </div>
          </>
          )}
        </div>
      )}
    </div>
  );
}
