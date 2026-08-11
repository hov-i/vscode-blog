import { Icon } from "@/shared/ui/icon";

export const StatusBar = () => {
  return (
    <footer
      id="status-bar"
      className="h-6 flex items-center justify-between px-3 text-xs bg-[var(--vscode-status-bar-bg)] text-[var(--vscode-status-bar-fg)] border-t border-[var(--border-color)] shrink-0"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center cursor-pointer hover:bg-[var(--vscode-status-bar-hover)] px-1 rounded">
          <Icon name="gitBranch" className="w-3 h-3 mr-1" />
          <span>main</span>
        </div>
        <div className="flex items-center cursor-pointer hover:bg-[var(--vscode-status-bar-hover)] px-1 rounded">
          <Icon name="check" className="w-3 h-3 mr-1" />
          <span>No Issues</span>
        </div>
        <div className="flex items-center cursor-pointer hover:bg-[var(--vscode-status-bar-hover)] px-1 rounded">
          <Icon name="wifi" className="w-3 h-3 mr-1" />
          <span>Connected</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <span className="cursor-pointer hover:bg-[var(--vscode-status-bar-hover)] px-1 rounded">Ln 1, Col 1</span>
        <span className="cursor-pointer hover:bg-[var(--vscode-status-bar-hover)] px-1 rounded">UTF-8</span>
        <span className="cursor-pointer hover:bg-[var(--vscode-status-bar-hover)] px-1 rounded">JSX</span>
        <div className="flex items-center cursor-pointer hover:bg-[var(--vscode-status-bar-hover)] px-1 rounded">
          <Icon name="bell" className="w-3 h-3 mr-1" />
          <span>3</span>
        </div>
      </div>
    </footer>
  );
};
