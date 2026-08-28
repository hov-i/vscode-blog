"use client";

import { useState } from "react";

const UI_FONT = "'Segoe UI Variable','Segoe UI',system-ui,sans-serif";

type Tab = { id: string; label: string; icon: string; iconSize: number; last?: boolean };

// Literal 4 open tabs from design.html section 06 — decorative now (no routes
// left to switch between), clicking just changes which tab looks active.
const TABS: Tab[] = [
  { id: "fluent-tokens.md", label: "fluent-tokens.md", icon: "/icons/file-doc-accent.svg", iconSize: 16 },
  { id: "index.md", label: "index.md", icon: "/icons/file-doc.svg", iconSize: 16 },
  { id: "nuxt.config.ts", label: "nuxt.config.ts", icon: "/icons/file-ts.svg", iconSize: 16 },
  { id: "index.vue", label: "index.vue", icon: "/icons/file-vue.svg", iconSize: 16, last: true },
];

export const TabsBar = () => {
  const [activeId, setActiveId] = useState("fluent-tokens.md");

  return (
    <div style={{ position: "relative", height: 40, display: "flex", alignItems: "flex-end", padding: "0 10px 0 0" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "row", alignItems: "flex-end", padding: 0, overflow: "hidden" }}>
        <div style={{ width: 8, flex: "none" }} />
        {TABS.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              style={{ position: "relative", width: 160, height: 32, flex: "none", textAlign: "left" }}
            >
              {active ? (
                <>
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 32, background: "rgba(40,40,40,.75)", borderRadius: "7px 7px 0 0", boxShadow: "inset 1px 1px 0 0 rgba(0,0,0,.1622), inset -1px 0 0 0 rgba(0,0,0,.1622)" }} />
                  <div style={{ position: "absolute", left: 1, right: 1, bottom: -1, height: 2, background: "rgba(40,40,40,.75)" }} />
                </>
              ) : (
                <div className="hover:bg-[rgba(255,255,255,.0605)]" style={{ position: "absolute", left: 1, right: 1, bottom: 1, height: 30, borderRadius: "7px 7px 0 0" }} />
              )}
              <img src={tab.icon} alt="" width={tab.iconSize} height={tab.iconSize} style={{ pointerEvents: "none", position: "absolute", left: 8, top: 8, display: "block" }} />
              <span
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  left: 32,
                  right: 32,
                  top: 5,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: UI_FONT,
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  color: active ? "#FFFFFF" : "rgba(255,255,255,.786)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tab.label}
              </span>
              {!tab.last && (
                <div style={{ pointerEvents: "none", position: "absolute", right: 0, top: 8, width: 1, height: 16, background: "rgba(255,255,255,.0837)" }} />
              )}
              <div className="hover:bg-[rgba(255,255,255,.0605)]" style={{ position: "absolute", right: 0, top: 0, width: 40, height: 32, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#FFFFFF" : "rgba(255,255,255,.786)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: "block" }}>
                  <path d="M2.6 2.6 L9.4 9.4 M9.4 2.6 L2.6 9.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 2, padding: "0 0 4px 10px", color: "rgba(255,255,255,.786)" }}>
        <button type="button" className="w-7 h-6 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,.0605)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" /><rect x="10.5" y="2.5" width="4" height="11" fill="currentColor" /></svg>
        </button>
        <button type="button" className="w-7 h-6 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,.0605)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="4" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="12" cy="8" r="1.3" /></svg>
        </button>
      </div>
    </div>
  );
};
