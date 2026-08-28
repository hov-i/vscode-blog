"use client";

import { Icon } from "@/shared/ui/icon";
import { FigIcon } from "@/shared/ui/fig-icon";

interface ActivityBarProps {
  sidebarView: "explorer" | "search";
  onToggleSearch: () => void;
}

// Rail icon stack from design.html section 06 — mostly decorative, except
// the first slot: a real Search (Codicon, react-icons/vsc — the actual
// VS Code icon set) toggling the sidebar's Explorer/Search view.
export const ActivityBar = ({ sidebarView, onToggleSearch }: ActivityBarProps) => {
  const isSearchActive = sidebarView === "search";

  return (
    <aside
      id="activity-bar"
      className="w-[50px] lg:flex hidden flex-col items-center justify-between bg-[var(--bg-tertiary)] shrink-0 lg:rounded-[7px] lg:border lg:border-[var(--vscode-panel-border)] py-4 px-3 overflow-hidden"
    >
      <div className="flex flex-col items-center gap-8">
        <button
          type="button"
          onClick={onToggleSearch}
          title="검색"
          aria-label="검색"
          aria-pressed={isSearchActive}
          className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,.0605)] transition-colors"
          style={{ color: isSearchActive ? "rgb(96,205,255)" : "#A6A6A6" }}
        >
          {isSearchActive && (
            <span aria-hidden className="absolute inset-0 rounded" style={{ background: "rgba(255,255,255,.0605)" }} />
          )}
          <Icon name="search" className="relative w-5 h-5" />
        </button>
        <div className="h-6 flex items-center text-[#A6A6A6]">
          <FigIcon name="ArrowSplitSize24ThemeRegular" size={24} />
        </div>
        <div className="h-6 flex items-center text-[#A6A6A6]">
          <FigIcon name="BugSize24ThemeRegular" size={24} />
        </div>
        <div className="h-6 flex items-center text-[#A6A6A6]">
          <FigIcon name="ChatSize24ThemeRegular" size={24} />
        </div>
        <div className="h-6 flex items-center text-[#A6A6A6]">
          <FigIcon name="GlobeSize24ThemeRegular" size={24} />
        </div>
        <div className="h-6 flex items-center text-[#A6A6A6]">
          <FigIcon name="DesktopSignalSize24ThemeRegular" size={24} />
        </div>
        <div className="h-6 flex items-center text-[#A6A6A6]">
          <FigIcon name="AppsSize24ThemeRegular" size={24} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-8">
        <div className="h-6 flex items-center text-[rgba(255,255,255,.7)]">
          <FigIcon name="PersonSize24ThemeRegular" size={24} />
        </div>
        <div className="h-6 flex items-center text-[rgba(255,255,255,.7)]">
          <FigIcon name="SettingsSize24ThemeRegular" size={24} />
        </div>
      </div>
    </aside>
  );
};
