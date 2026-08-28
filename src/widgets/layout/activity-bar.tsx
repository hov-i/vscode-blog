"use client";

import { Icon } from "@/shared/ui/icon";
import { FigIcon } from "@/shared/ui/fig-icon";

interface ActivityBarProps {
  sidebarView: "explorer" | "search";
  activeFileId: string;
  onToggleSearch: () => void;
  onOpenGuestbook: () => void;
}

// Rail icon stack — just the two working entry points: Search (Codicon)
// toggles the sidebar's Explorer/Search view, Chat opens the guestbook doc.
export const ActivityBar = ({ sidebarView, activeFileId, onToggleSearch, onOpenGuestbook }: ActivityBarProps) => {
  const isSearchActive = sidebarView === "search";
  const isGuestbookActive = activeFileId === "guestbook";

  return (
    <aside
      id="activity-bar"
      className="w-[50px] lg:flex hidden flex-col items-center bg-[var(--bg-tertiary)] shrink-0 lg:rounded-[7px] lg:border lg:border-[var(--vscode-panel-border)] py-4 px-3 overflow-hidden"
    >
      <div className="flex flex-col items-center gap-8">
        <button
          type="button"
          onClick={onToggleSearch}
          title="검색"
          aria-label="검색"
          aria-pressed={isSearchActive}
          className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,.0605)] transition-colors"
          style={{ color: isSearchActive ? "rgb(96,205,255)" : "rgba(255,255,255,.7)" }}
        >
          {isSearchActive && (
            <span aria-hidden className="absolute inset-0 rounded" style={{ background: "rgba(255,255,255,.0605)" }} />
          )}
          <Icon name="search" className="relative w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenGuestbook}
          title="방명록"
          aria-label="방명록"
          aria-pressed={isGuestbookActive}
          className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,.0605)] transition-colors"
          style={{ color: isGuestbookActive ? "rgb(96,205,255)" : "#A6A6A6" }}
        >
          {isGuestbookActive && (
            <span aria-hidden className="absolute inset-0 rounded" style={{ background: "rgba(255,255,255,.0605)" }} />
          )}
          <FigIcon name="ChatSize24ThemeRegular" size={24} className="relative" />
        </button>
      </div>
    </aside>
  );
};
