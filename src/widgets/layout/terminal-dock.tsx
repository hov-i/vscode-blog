"use client";

import { useState } from "react";

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

// Literal "terminal — Claude Code CLI session" from design.html section 06.
export function TerminalDock() {
  const [tab, setTab] = useState<Tab>("Terminal");

  return (
    <div style={{ flex: "none", borderRadius: 7, background: "rgba(40,40,40,.75)", boxShadow: "0 0 0 1px rgba(0,0,0,.1622)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "2px 0 0 2px" }}>
            <img src="/icons/claude-mascot.png" alt="" style={{ flex: "none", width: 69, height: 46, display: "block", imageRendering: "pixelated", marginTop: 2 }} />
            <div style={{ flex: "none", fontFamily: MONO_FONT, fontWeight: 400, fontSize: 13, lineHeight: "18px" }}>
              <div style={{ height: 18, whiteSpace: "pre" }}>
                <span style={{ color: "#FFFFFF", fontWeight: 700 }}>Claude Code</span>
                <span style={{ color: "rgb(196,196,196)" }}> v2.1.250</span>
              </div>
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgb(196,196,196)" }}>Sonnet 5 · Claude Max</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgb(196,196,196)" }}>~\hoviProjects\vscode-blog</span></div>
            </div>
          </div>

          <div style={{ height: 18, marginTop: 4, whiteSpace: "pre" }}>
            <span style={{ color: "#E5A13A" }}>⚠ Your login expires in 3 days</span>
            <span style={{ color: "rgb(196,196,196)" }}> · run </span>
            <span style={{ color: "#FFFFFF" }}>/login</span>
            <span style={{ color: "rgb(196,196,196)" }}> to renew</span>
          </div>

          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ height: 18, whiteSpace: "pre" }}>
              <span style={{ color: "rgb(196,196,196)" }}>❯ </span>
              <span style={{ color: "#FFFFFF" }}>/init</span>
            </div>
            <div style={{ height: 18, whiteSpace: "pre", paddingLeft: 14 }}>
              <span style={{ color: "rgba(249,249,249,.5)" }}>└ </span>
              <span style={{ color: "rgb(83,214,128)" }}>✓ </span>
              <span style={{ color: "rgb(196,196,196)" }}>Portfolio loaded. Ready to explore hov_i&apos;s work.</span>
            </div>
          </div>

          <div style={{ height: 1, margin: "6px 0 0", background: "rgba(249,249,249,.1)" }} />

          <div style={{ height: 24, display: "flex", alignItems: "center", gap: 8, whiteSpace: "pre" }}>
            <span style={{ color: "rgb(196,196,196)" }}>❯</span>
            <span style={{ color: "rgba(249,249,249,.5)" }}>Start learning about hov_i...</span>
            <span className="animate-pulse" style={{ display: "inline-block", width: 8, height: 16, background: "#FFFFFF" }} />
          </div>

          <div style={{ height: 1, background: "rgba(249,249,249,.1)" }} />

          <div style={{ marginTop: 4, display: "flex", alignItems: "flex-start", gap: 16, paddingLeft: 14 }}>
            <div style={{ height: 18, whiteSpace: "pre", flex: 1, minWidth: 0 }}>
              <span style={{ color: "#E5A13A" }}>▸▸ auto mode on</span>
              <span style={{ color: "rgb(196,196,196)" }}> (shift+tab to cycle) · ↵ for agents</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: "none" }}>
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgb(83,214,128)" }}>/rc active</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
