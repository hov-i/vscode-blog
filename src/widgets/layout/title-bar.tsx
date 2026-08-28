"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const MENU_ITEMS = ["File", "Edit", "Selection", "View", "Go", "Run", "Terminal", "Help"];

interface TitleBarProps {
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const TitleBar = ({ terminalOpen, onToggleTerminal, sidebarOpen, onToggleSidebar }: TitleBarProps) => {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [minimizing, setMinimizing] = useState(false);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    }
  };

  const bumpMinimize = () => {
    setMinimizing(true);
    window.setTimeout(() => setMinimizing(false), 180);
  };

  return (
    <header
      id="title-bar"
      className="hidden lg:flex h-[35px] items-center shrink-0 select-none bg-[var(--vscode-title-bar-bg)] text-[var(--vscode-title-bar-fg)] text-[13px] relative"
    >
      {/* Left: app icon + menu */}
      <div className="flex-none flex items-center gap-0.5 pl-2.5 pr-1.5">
        <img src="/icons/app-icon.png" alt="" className="w-4 h-4 mr-1.5 block" />
        {MENU_ITEMS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={cn(
              "h-6 flex items-center px-2 rounded text-[13px] leading-none hover:bg-[rgba(255,255,255,0.0605)]",
              i === 0 && "bg-[rgba(255,255,255,0.0605)]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Center: back/forward + command centre pill + sync */}
      <div className="flex-1 min-w-0 flex items-center justify-center gap-2">
        <div className="flex items-center gap-0.5 text-[rgba(255,255,255,0.786)]">
          <button type="button" className="w-7 h-6 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.0605)] text-[rgba(255,255,255,0.786)]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M 7.6 2.4 L 4 6 L 7.6 9.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className="w-7 h-6 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.0605)] text-[rgba(255,255,255,0.36)]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M 4.4 2.4 L 8 6 L 4.4 9.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => router.push("/")}
          title="hovi-log"
          className="w-[640px] h-6 rounded-md flex items-center px-2.5 gap-1.5 hover:bg-[rgba(255,255,255,0.0326)]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.085)" }}
        >
          <span className="flex-1 min-w-0 text-xs text-white truncate text-left">hovi-log</span>
          <span className="flex-none flex items-center gap-1 text-[11px] text-[rgba(255,255,255,0.786)]">
            <span className="w-[5px] h-[5px] rounded-full bg-[rgba(255,255,255,0.786)] block" />1
          </span>
          <div className="flex-none flex items-center text-[rgba(255,255,255,0.786)]">
            <span className="w-[22px] h-5 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.0605)]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2.5 3.5h11a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H8.5l-3 2.5V10.5H2.5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1" /></svg>
            </span>
            <span className="w-4 h-5 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.0605)]">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M 2.4 4.6 L 6 8.2 L 9.6 4.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
        </button>

        <button type="button" className="flex-none w-[26px] h-6 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.0605)] text-[rgba(255,255,255,0.786)]">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" /><path d="M8 1.5A6.5 6.5 0 0 0 8 14.5Z" fill="currentColor" /></svg>
        </button>
      </div>

      {/* Right: layout toggles (Figma file's literal 4-icon group) + window controls */}
      <div className="flex-none flex items-center gap-0.5">
        <div className="flex items-center gap-0.5 px-2">
          <button
            type="button"
            title="Toggle Primary Side Bar"
            onClick={onToggleSidebar}
            aria-pressed={sidebarOpen}
            className={cn(
              "w-7 h-6 flex items-center justify-center rounded hover:bg-[var(--vscode-hover-bg)]",
              sidebarOpen ? "text-[var(--accent)]" : "text-[rgba(255,255,255,0.786)]"
            )}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" /><rect x="1.5" y="2.5" width="4" height="11" fill="currentColor" /></svg>
          </button>
          <button type="button" title="Toggle Status Bar" className="w-7 h-6 flex items-center justify-center rounded hover:bg-[var(--vscode-hover-bg)] text-[rgba(255,255,255,0.786)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" /><rect x="1.5" y="2.5" width="13" height="3.5" fill="currentColor" /></svg>
          </button>
          <button
            type="button"
            title="Toggle Panel (Terminal)"
            onClick={onToggleTerminal}
            aria-pressed={terminalOpen}
            className={cn(
              "w-7 h-6 flex items-center justify-center rounded hover:bg-[var(--vscode-hover-bg)]",
              terminalOpen ? "text-[var(--accent)]" : "text-[rgba(255,255,255,0.786)]"
            )}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" /><rect x="1.5" y="10" width="13" height="3.5" fill="currentColor" /></svg>
          </button>
          <button type="button" title="Toggle Secondary Side Bar" className="w-7 h-6 flex items-center justify-center rounded hover:bg-[var(--vscode-hover-bg)] text-[rgba(255,255,255,0.786)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" /><rect x="10.5" y="2.5" width="4" height="11" fill="currentColor" /></svg>
          </button>
        </div>
        <button
          type="button"
          title="Minimize"
          onClick={bumpMinimize}
          className="w-[46px] self-stretch flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.0605)]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={cn("transition-transform", minimizing && "scale-75")}>
            <path d="M0 5h10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          type="button"
          title={isFullscreen ? "Restore Down" : "Maximize"}
          onClick={toggleFullscreen}
          className="w-[46px] self-stretch flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.0605)]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" /></svg>
        </button>
        <button
          type="button"
          title="Close (back to home)"
          onClick={() => router.push("/")}
          className="w-[46px] self-stretch rounded-tr-[7px] flex items-center justify-center text-white hover:bg-[#C42B1C]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M0.4 0.4 L9.6 9.6 M9.6 0.4 L0.4 9.6" stroke="currentColor" strokeWidth="1" /></svg>
        </button>
      </div>
    </header>
  );
};
