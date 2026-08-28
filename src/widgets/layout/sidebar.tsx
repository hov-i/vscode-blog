"use client";

import { Icon } from "@/shared/ui/icon";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface SidebarProps {
  onClose?: () => void;
}

const UI_FONT = "'Segoe UI Variable','Segoe UI',system-ui,sans-serif";
const MONO_FONT = "Consolas,'Cascadia Mono',Menlo,monospace";

function Chevron({ down }: { down: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: "block" }}>
      <path
        d={down ? "M 2.4 4.4 L 6 8 L 9.6 4.4" : "M 4.4 2.4 L 8 6 L 4.4 9.6"}
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Row = {
  kind: "folder" | "file";
  label: string;
  chevronLeft?: number;
  chevronDown?: boolean;
  iconLeft: number;
  labelLeft: number;
  icon: string;
  iconW: number;
  iconH: number;
  badge?: { text: string; color: string };
  active?: boolean;
  labelColor?: string;
};

// Literal explorer tree from design.html section 06 — pixel offsets copied
// as-is (the mockup isn't a consistent recursive-depth tree, so this mirrors
// its exact per-row left offsets rather than deriving them from a formula).
const ROWS: Row[] = [
  { kind: "folder", label: "content", chevronLeft: 18, chevronDown: true, iconLeft: 48, labelLeft: 72, icon: "/icons/file-folder.svg", iconW: 16, iconH: 14 },
  { kind: "folder", label: "posts", chevronLeft: 34, chevronDown: true, iconLeft: 64, labelLeft: 88, icon: "/icons/file-folder.svg", iconW: 16, iconH: 14, badge: { text: "3", color: "rgb(96,205,255)" } },
  { kind: "file", label: "fluent-tokens.md", iconLeft: 76, labelLeft: 104, icon: "/icons/file-doc-accent.svg", iconW: 16, iconH: 20, badge: { text: "M", color: "rgb(96,205,255)" }, active: true },
  { kind: "file", label: "index.md", iconLeft: 76, labelLeft: 104, icon: "/icons/file-doc.svg", iconW: 16, iconH: 20, badge: { text: "M", color: "rgb(96,205,255)" }, labelColor: "rgb(249,249,249)" },
  { kind: "file", label: "about.md", iconLeft: 76, labelLeft: 104, icon: "/icons/file-doc.svg", iconW: 16, iconH: 20, labelColor: "rgb(249,249,249)" },
  { kind: "folder", label: "drafts", chevronLeft: 34, chevronDown: false, iconLeft: 64, labelLeft: 88, icon: "/icons/file-folder.svg", iconW: 16, iconH: 14, badge: { text: "2", color: "rgb(196,196,196)" }, labelColor: "rgb(249,249,249)" },
  { kind: "folder", label: "components", chevronLeft: 18, chevronDown: false, iconLeft: 48, labelLeft: 72, icon: "/icons/file-folder.svg", iconW: 16, iconH: 14, labelColor: "rgb(249,249,249)" },
  { kind: "file", label: "index.vue", iconLeft: 60, labelLeft: 88, icon: "/icons/file-vue.svg", iconW: 16, iconH: 16, labelColor: "rgb(249,249,249)" },
  { kind: "file", label: "nuxt.config.ts", iconLeft: 44, labelLeft: 72, icon: "/icons/file-ts.svg", iconW: 16, iconH: 16, badge: { text: "M", color: "rgb(96,205,255)" }, labelColor: "rgb(249,249,249)" },
  { kind: "file", label: "package.json", iconLeft: 44, labelLeft: 72, icon: "/icons/file-json.svg", iconW: 16, iconH: 16, labelColor: "rgb(249,249,249)" },
  { kind: "file", label: ".eslintrc.js", iconLeft: 44, labelLeft: 72, icon: "/icons/file-eslint.svg", iconW: 16, iconH: 15, labelColor: "rgb(249,249,249)" },
  { kind: "file", label: ".gitignore", iconLeft: 44, labelLeft: 72, icon: "/icons/file-git.svg", iconW: 16, iconH: 16, badge: { text: "U", color: "rgb(83,214,128)" }, labelColor: "rgba(255,255,255,.4)" },
];

const ExplorerRow = ({ row }: { row: Row }) => (
  <div style={{ position: "relative", height: 32, borderRadius: 4, flex: "none" }} className="group">
    <div
      className="absolute inset-x-[5px] top-[3px] bottom-[3px] rounded-[3px] group-hover:bg-[rgba(255,255,255,.0605)]"
      style={row.active ? { background: "rgba(255,255,255,.0605)" } : undefined}
    />
    {row.chevronLeft !== undefined && (
      <div style={{ pointerEvents: "none", position: "absolute", left: row.chevronLeft, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
        <Chevron down={!!row.chevronDown} />
      </div>
    )}
    <div style={{ pointerEvents: "none", position: "absolute", left: row.iconLeft, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
      <img src={row.icon} alt="" width={row.iconW} height={row.iconH} style={{ display: "block" }} />
    </div>
    <span
      style={{
        pointerEvents: "none",
        position: "absolute",
        left: row.labelLeft,
        right: 34,
        top: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        fontFamily: UI_FONT,
        fontSize: 14,
        color: row.labelColor ?? "#FFFFFF",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {row.label}
    </span>
    {row.badge && (
      <span style={{ pointerEvents: "none", position: "absolute", right: 12, top: 0, bottom: 0, display: "flex", alignItems: "center", font: `400 12px/16px ${MONO_FONT}`, color: row.badge.color }}>
        {row.badge.text}
      </span>
    )}
  </div>
);

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <aside
      id="sidebar"
      className="w-[calc(100vw-3rem)] max-w-xs lg:w-60 h-full flex flex-col bg-[var(--bg-tertiary)] border-r border-[var(--border-color)] lg:border-none shrink-0 lg:rounded-[7px] lg:ring-1 lg:ring-[var(--vscode-panel-border)] lg:overflow-hidden lg:p-1.5 lg:gap-2"
    >
      {/* Mobile-only Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 h-12 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="logo" className="text-[var(--accent)]" />
          <span className="text-xs font-bold text-[var(--text-primary)]">VSCODE BLOG</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-[var(--vscode-hover-bg)] rounded text-[var(--text-secondary)]"
            aria-label="테마 전환"
          >
            {mounted && theme === "light" ? <Icon name="sun" /> : <Icon name="moon" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--vscode-hover-bg)] rounded text-[var(--text-secondary)]"
              aria-label="메뉴 닫기"
            >
              <Icon name="close" />
            </button>
          )}
        </div>
      </div>

      {/* EXPLORER header */}
      <div style={{ height: 26, flex: "none", display: "flex", alignItems: "center", padding: "0 4px 0 10px", gap: 8 }}>
        <span style={{ flex: 1, minWidth: 0, fontFamily: UI_FONT, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.786)", whiteSpace: "nowrap" }}>
          Explorer
        </span>
        <button type="button" className="w-[22px] h-[22px] flex items-center justify-center rounded hover:bg-[rgba(255,255,255,.0605)] text-[rgba(255,255,255,.786)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ display: "block" }}>
            <circle cx="4" cy="8" r="1.3" />
            <circle cx="8" cy="8" r="1.3" />
            <circle cx="12" cy="8" r="1.3" />
          </svg>
        </button>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto select-none flex flex-col">
        {ROWS.map((row) => (
          <ExplorerRow key={row.label} row={row} />
        ))}
      </div>

      {/* Account row */}
      <div style={{ marginTop: "auto", padding: "6px 0 0", boxShadow: "inset 0 1px 0 0 rgba(249,249,249,.1)" }}>
        <div className="group" style={{ position: "relative", height: 44, borderRadius: 4 }}>
          <div className="absolute inset-x-[5px] top-[3px] bottom-[3px] rounded-[3px] group-hover:bg-[rgba(255,255,255,.0605)]" />
          <img
            src="/icons/figma-avatar.png"
            alt=""
            style={{ pointerEvents: "none", position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: 9999, display: "block" }}
          />
          <span
            style={{ pointerEvents: "none", position: "absolute", left: 52, right: 34, top: "50%", transform: "translateY(calc(-50% - 9px))", height: 18, fontFamily: UI_FONT, fontSize: 14, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            hov_i
          </span>
          <span
            style={{ pointerEvents: "none", position: "absolute", left: 52, right: 34, top: "50%", transform: "translateY(1px)", height: 16, fontFamily: UI_FONT, fontSize: 12, color: "rgba(255,255,255,.786)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            Connected via GitHub
          </span>
          <div style={{ pointerEvents: "none", position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(255,255,255,.786)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Chevron down />
          </div>
        </div>
      </div>
    </aside>
  );
};
