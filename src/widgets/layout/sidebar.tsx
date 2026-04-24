"use client";

import { Icon, IconKey } from "@/shared/ui/icon";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { UserProfile } from "./user-profile";
import { useTheme } from "next-themes";

interface SidebarProps {
  postCount?: number;
  projectCount?: number;
}

const ROW = "flex items-center h-[22px] text-[13px] cursor-pointer whitespace-nowrap";
const ICON_MD_COLOR = "text-[#519aba]";

type FileRowProps = {
  href: string;
  name: string;
  icon: IconKey;
  iconColor?: string;
  depth: number;
  active: boolean;
};

const FileRow = ({ href, name, icon, iconColor, depth, active }: FileRowProps) => (
  <Link href={href}>
    <div
      className={cn(
        ROW,
        "hover:bg-[var(--vscode-hover-bg)]",
        active
          ? "bg-[var(--vscode-list-active-bg)] text-[var(--vscode-list-active-fg)]"
          : "text-[var(--text-primary)]"
      )}
      style={{ paddingLeft: `${8 + depth * 8}px`, paddingRight: 8 }}
    >
      <span className="w-3 mr-1" />
      <Icon name={icon} className={cn("w-4 h-4 mr-1.5 shrink-0", iconColor)} />
      <span className="truncate">{name}</span>
    </div>
  </Link>
);

type FolderRowProps = {
  href: string;
  label: string;
  depth: number;
  expanded: boolean;
  onToggle?: () => void;
  active: boolean;
  count?: number;
  iconColor?: string;
};

const FolderRow = ({ href, label, depth, expanded, onToggle, active, count, iconColor }: FolderRowProps) => (
  <div
    className={cn(
      ROW,
      "group hover:bg-[var(--vscode-hover-bg)]",
      active
        ? "bg-[var(--vscode-list-active-bg)] text-[var(--vscode-list-active-fg)]"
        : "text-[var(--text-primary)]"
    )}
    style={{ paddingLeft: `${8 + depth * 8}px`, paddingRight: 8 }}
  >
    <button
      type="button"
      aria-label={expanded ? "Collapse" : "Expand"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle?.();
      }}
      className="shrink-0 flex items-center justify-center w-3 h-4 mr-1"
    >
      <Icon
        name={expanded ? "chevronDown" : "chevronRight"}
        className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
      />
    </button>
    <Link href={href} className="flex items-center flex-1 min-w-0">
      <Icon
        name={expanded ? "folderOpen" : "folder"}
        className={cn("w-4 h-4 mr-1.5 shrink-0", iconColor ?? "text-[#dcb67a]")}
      />
      <span className="truncate">{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="ml-auto pl-2 text-[11px] text-[var(--text-secondary)]">{count}</span>
      )}
    </Link>
  </div>
);

export const Sidebar = ({ postCount, projectCount }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [homeOpen, setHomeOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname === "/" || pathname === "/about") setHomeOpen(true);
  }, [pathname]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const startsWith = (p: string) => pathname === p || pathname.startsWith(p + "/");
  const isHomeActive = pathname === "/" || pathname === "/about";

  return (
    <aside
      id="sidebar"
      className="w-64 flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)] shrink-0"
    >
      {/* Mobile-only Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 h-12 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-2">
          <Icon name="logo" className="text-[var(--accent)]" />
          <span className="text-xs font-bold text-[var(--text-primary)]">VSCODE BLOG</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-[var(--vscode-hover-bg)] rounded text-[var(--text-secondary)]"
        >
          {mounted && theme === "light" ? <Icon name="sun" /> : <Icon name="moon" />}
        </button>
      </div>

      {/* EXPLORER title bar */}
      <div className="h-9 px-4 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)]">
          Explorer
        </span>
        <button className="p-1 hover:bg-[var(--vscode-hover-bg)] rounded text-[var(--text-secondary)]">
          <Icon name="more" className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-2 pb-2 shrink-0">
        <div className="flex items-center px-2 py-1 rounded-sm bg-[var(--vscode-input-bg)] border border-[var(--vscode-input-border)] focus-within:border-[var(--vscode-focus-border)] transition-colors">
          <Icon name="search" className="w-3 h-3 mr-2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search posts..."
            className="bg-transparent outline-none text-xs flex-1 text-[var(--vscode-input-fg)] placeholder-[var(--text-secondary)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim()) {
                router.push(`/posts?q=${encodeURIComponent(search.trim())}`);
              } else if (e.key === "Enter" && !search.trim()) {
                router.push("/posts");
              }
            }}
          />
        </div>
      </div>

      {/* Workspace folder header */}
      <div className="flex items-center h-[22px] px-2 group select-none">
        <Icon name="chevronDown" className="w-3 h-3 mr-1 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[11px] font-semibold tracking-wide uppercase text-[var(--text-primary)] flex-1 truncate">
          hovi-log
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button title="New File" className="p-0.5 hover:bg-[var(--vscode-hover-bg)] rounded text-[var(--text-secondary)]">
            <Icon name="newFile" className="w-4 h-4" />
          </button>
          <button title="New Folder" className="p-0.5 hover:bg-[var(--vscode-hover-bg)] rounded text-[var(--text-secondary)]">
            <Icon name="newFolder" className="w-4 h-4" />
          </button>
          <button title="Refresh" className="p-0.5 hover:bg-[var(--vscode-hover-bg)] rounded text-[var(--text-secondary)]">
            <Icon name="refresh" className="w-4 h-4" />
          </button>
          <button title="Collapse All" className="p-0.5 hover:bg-[var(--vscode-hover-bg)] rounded text-[var(--text-secondary)]">
            <Icon name="collapseAll" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto select-none">
        {/* home/ folder with nested md files */}
        <FolderRow
          href="/"
          label="home"
          depth={1}
          expanded={homeOpen}
          onToggle={() => setHomeOpen((v) => !v)}
          active={isHomeActive && !homeOpen}
        />
        {homeOpen && (
          <>
            <FileRow
              href="/"
              name="welcome.md"
              icon="markdown"
              iconColor={ICON_MD_COLOR}
              depth={2}
              active={pathname === "/"}
            />
            <FileRow
              href="/about"
              name="about.md"
              icon="markdown"
              iconColor={ICON_MD_COLOR}
              depth={2}
              active={pathname === "/about"}
            />
          </>
        )}

        <FolderRow
          href="/posts"
          label="posts"
          depth={1}
          expanded={false}
          active={startsWith("/posts")}
          count={postCount}
        />
        <FolderRow
          href="/projects"
          label="projects"
          depth={1}
          expanded={false}
          active={startsWith("/projects")}
          count={projectCount}
        />
        <FolderRow
          href="/tags"
          label="tags"
          depth={1}
          expanded={false}
          active={startsWith("/tags")}
        />

        <FileRow
          href="/guestbook"
          name="guestbook.md"
          icon="markdown"
          iconColor={ICON_MD_COLOR}
          depth={1}
          active={startsWith("/guestbook")}
        />
      </div>

      <div className="p-3 border-t border-[var(--border-color)] shrink-0">
        <UserProfile />
      </div>
    </aside>
  );
};
