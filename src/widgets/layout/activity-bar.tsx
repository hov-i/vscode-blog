import { FigIcon } from "@/shared/ui/fig-icon";

const DOCUMENT_ICON_PATH =
  "M 8 0 L 8 6 C 8 7.105 8.895 8 10 8 L 16 8 L 16 18 C 16 19.105 15.105 20 14 20 L 2 20 C 0.895 20 0 19.105 0 18 L 0 2 C 0 0.895 0.895 0 2 0 L 8 0 Z M 9.5 0.5 L 9.5 6 C 9.5 6.276 9.724 6.5 10 6.5 L 15.5 6.5 L 9.5 0.5 Z";

// Literal rail icon stack from design.html section 06 — decorative (no
// routes left to navigate to), matches the doc's Document/ArrowSplit/Bug/
// Chat/Globe/DesktopSignal/Apps + Person/Settings icon set exactly.
export const ActivityBar = () => (
  <aside
    id="activity-bar"
    className="w-[50px] lg:flex hidden flex-col items-center justify-between bg-[var(--bg-tertiary)] shrink-0 lg:rounded-[7px] lg:ring-1 lg:ring-[var(--vscode-panel-border)] py-4 px-3 overflow-hidden"
  >
    <div className="flex flex-col items-center gap-8">
      <div className="h-6 flex items-center text-[rgb(96,205,255)]">
        <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
          <path d={DOCUMENT_ICON_PATH} fillRule="evenodd" />
        </svg>
      </div>
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
