"use client";

import { Icon } from "@/shared/ui/icon";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { ZOOM_SCALE } from "@/shared/lib/ui/zoom-scale";
import { SidebarAccount } from "@/widgets/layout/sidebar-account";
import {
  buildFileTreeRows,
  buildPostFile,
  buildProjectFile,
  buildSearchResultRow,
  DEFAULT_COLLAPSED_FOLDER_IDS,
  iconForFile,
  isRowVisible,
  type FileMeta,
  type PostSummary,
  type ProjectSummary,
  type Row,
} from "@/widgets/layout/file-tree-data";

interface SidebarProps {
  onClose?: () => void;
  posts: PostSummary[];
  projects: ProjectSummary[];
  activeFileId: string;
  onOpenFile: (file: FileMeta) => void;
  sidebarView: "explorer" | "search";
}

const UI_FONT = "'Segoe UI Variable','Segoe UI',system-ui,sans-serif";
const MONO_FONT = "Consolas,'Cascadia Mono',Menlo,monospace";

const DEFAULT_SIDEBAR_WIDTH = 240;
const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 420;

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

const ExplorerRow = ({
  row,
  active,
  expanded,
  onClick,
}: {
  row: Row;
  active: boolean;
  expanded: boolean;
  onClick?: () => void;
}) => {
  const icon = iconForFile(row.icon, active);

  return (
  <div
    style={{ position: "relative", height: 32, borderRadius: 4, flex: "none", cursor: row.kind === "folder" || row.kind === "file" ? "pointer" : "default" }}
    className="group"
    onClick={onClick}
  >
    <div
      className="absolute inset-x-[5px] top-[3px] bottom-[3px] rounded-[3px] group-hover:bg-[rgba(255,255,255,.0605)]"
      style={active ? { background: "rgba(255,255,255,.0605)" } : undefined}
    />
    {row.chevronLeft !== undefined && (
      <div style={{ pointerEvents: "none", position: "absolute", left: row.chevronLeft, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
        <Chevron down={expanded} />
      </div>
    )}
    <div style={{ pointerEvents: "none", position: "absolute", left: row.iconLeft, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
      <img src={icon} alt="" width={row.iconW} height={row.iconH} style={{ display: "block" }} />
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
};

export const Sidebar = ({ onClose, posts, projects, activeFileId, onOpenFile, sidebarView }: SidebarProps) => {
  const { theme, setTheme } = useTheme();
  const rows = buildFileTreeRows({ posts, projects });
  const [mounted, setMounted] = useState(false);
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [collapsedFolderIds, setCollapsedFolderIds] = useState<Set<string>>(() => new Set(DEFAULT_COLLAPSED_FOLDER_IDS));
  const [searchQuery, setSearchQuery] = useState("");
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  function toggleFolder(id: string) {
    setCollapsedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const postMatches = posts.filter((p) => p.title.toLowerCase().includes(q)).map(buildPostFile);
    const projectMatches = projects.filter((p) => p.title.toLowerCase().includes(q)).map(buildProjectFile);
    return [...postMatches, ...projectMatches];
  }, [searchQuery, posts, projects]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragRef.current) return;
      const { startX, startWidth } = dragRef.current;
      const deltaX = (e.clientX - startX) / ZOOM_SCALE;
      const next = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, startWidth + deltaX));
      setWidth(next);
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
    dragRef.current = { startX: e.clientX, startWidth: width };
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <aside
      id="sidebar"
      className="relative w-[calc(100vw-3rem)] max-w-xs lg:max-w-none lg:w-[var(--sidebar-width)] h-full flex flex-col bg-[var(--bg-tertiary)] border-r border-[var(--border-color)] lg:border lg:border-[var(--vscode-panel-border)] shrink-0 lg:rounded-[7px] lg:overflow-hidden lg:p-1.5 lg:gap-2"
      style={{ "--sidebar-width": `${width}px` } as React.CSSProperties}
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

      {/* EXPLORER / SEARCH header */}
      <div style={{ height: 26, flex: "none", display: "flex", alignItems: "center", padding: "0 4px 0 10px", gap: 8 }}>
        <span style={{ flex: 1, minWidth: 0, fontFamily: UI_FONT, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.786)", whiteSpace: "nowrap" }}>
          {sidebarView === "search" ? "Search" : "Explorer"}
        </span>
        <button type="button" className="w-[22px] h-[22px] flex items-center justify-center rounded hover:bg-[rgba(255,255,255,.0605)] text-[rgba(255,255,255,.786)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ display: "block" }}>
            <circle cx="4" cy="8" r="1.3" />
            <circle cx="8" cy="8" r="1.3" />
            <circle cx="12" cy="8" r="1.3" />
          </svg>
        </button>
      </div>

      {sidebarView === "search" ? (
        <div className="flex-1 overflow-y-auto select-none flex flex-col">
          <div style={{ padding: "0 10px 8px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="게시물, 프로젝트 검색..."
              autoFocus
              style={{
                width: "100%",
                height: 26,
                borderRadius: 3,
                background: "rgb(51,51,51)",
                border: "1px solid rgba(255,255,255,.14)",
                outline: "none",
                padding: "0 8px",
                fontFamily: UI_FONT,
                fontSize: 13,
                color: "#FFFFFF",
              }}
            />
          </div>
          {searchQuery.trim() === "" ? (
            <div style={{ padding: "4px 14px", font: `400 12px/18px ${UI_FONT}`, color: "rgba(255,255,255,.5)" }}>
              게시물, 프로젝트 제목으로 검색하세요.
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ padding: "4px 14px", font: `400 12px/18px ${UI_FONT}`, color: "rgba(255,255,255,.5)" }}>
              검색 결과가 없습니다.
            </div>
          ) : (
            searchResults.map((file) => (
              <ExplorerRow
                key={file.id}
                row={buildSearchResultRow(file)}
                active={file.id === activeFileId}
                expanded={false}
                onClick={() => onOpenFile(file)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto select-none flex flex-col">
          {rows
            .filter((row) => isRowVisible(row, rows, collapsedFolderIds))
            .map((row) => (
              <ExplorerRow
                key={row.id}
                row={row}
                active={row.file?.id === activeFileId}
                expanded={row.kind === "folder" ? !collapsedFolderIds.has(row.id) : false}
                onClick={
                  row.kind === "file" && row.file
                    ? () => onOpenFile(row.file!)
                    : row.kind === "folder"
                      ? () => toggleFolder(row.id)
                      : undefined
                }
              />
            ))}
        </div>
      )}

      {/* Account row — real GitHub sign-in via Supabase Auth */}
      <div style={{ marginTop: "auto", padding: "6px 0 0", boxShadow: "inset 0 1px 0 0 rgba(249,249,249,.1)" }}>
        <SidebarAccount />
      </div>

      {/* Resize handle — desktop only, mirrors the terminal panel's drag splitter */}
      <div
        className={`hidden lg:block vertical-resize-handle${isResizing ? " dragging" : ""}`}
        onMouseDown={handleResizeStart}
        style={{ position: "absolute", top: 0, bottom: 0, right: -5, width: 9, cursor: "col-resize", zIndex: 10 }}
      />
    </aside>
  );
};
