"use client";

import { Icon } from "@/shared/ui/icon";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { UserProfile } from "./user-profile";
import { useTheme } from "next-themes";
import { useEffect, useState as useReactState } from "react";

interface SidebarProps {
  postCount?: number;
  projectCount?: number;
}

export const Sidebar = ({ postCount, projectCount }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useReactState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useReactState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isActive = (path: string) => {
    if (path === "/" && (pathname === "/" || pathname === "/about")) return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const NavItem = ({ href, icon, label, chevron = true, count, subItems }: any) => {
    const active = isActive(href);
    return (
      <>
        <Link href={href}>
          <div
            className={cn(
              "flex items-center px-3 py-1.5 cursor-pointer hover:bg-[var(--vscode-list-hover-bg)] text-[var(--text-primary)] transition-colors",
              active && "bg-[var(--vscode-list-active-bg)] text-[var(--vscode-list-active-fg)]"
            )}
          >
            {chevron && (
              <Icon
                name={active ? "chevronDown" : "chevronRight"}
                className={cn("w-3 h-3 mr-2 text-[var(--text-secondary)]", active && "text-[var(--vscode-list-active-fg)]")}
              />
            )}
            <Icon
              name={icon}
              className={cn("w-3 h-3 mr-2 text-[var(--text-secondary)]", active && "text-[var(--vscode-list-active-fg)]")}
            />
            <span className={cn("text-sm font-medium", active && "font-bold")}>{label}</span>
            {count && (
              <span className="ml-auto text-xs px-1.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                {count}
              </span>
            )}
          </div>
        </Link>
        {active && subItems && (
           <div className="ml-6 py-1 border-l border-[var(--border-color)]">
              {subItems}
           </div>
        )}
      </>
    );
  };

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
          className="p-2 hover:bg-white/10 rounded text-[var(--text-secondary)]"
        >
          {mounted && theme === "light" ? <Icon name="sun" /> : <Icon name="moon" />}
        </button>
      </div>

      <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--border-color)] shrink-0">
        <span className="text-xs font-semibold tracking-wider text-[var(--text-secondary)]">
          EXPLORER
        </span>
        <button className="hover:bg-white/10 px-2 py-1 rounded text-[var(--text-secondary)]">
          <Icon name="more" className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-3 border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center px-2 py-1.5 rounded bg-[var(--bg-tertiary)]">
          <Icon name="search" className="w-3 h-3 mr-2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search posts..."
            className="bg-transparent outline-none text-xs flex-1 text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
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

      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          {/* HOME SECTION with mocked subfiles */}
          <NavItem 
            href="/" 
            icon="home" 
            label="HOME" 
            subItems={
              <>
                 <Link href="/">
                   <div className={cn(
                     "flex items-center px-3 py-1 cursor-pointer hover:bg-white/10 rounded text-[var(--text-primary)]",
                     pathname === "/" && "bg-white/5 font-medium"
                   )}>
                      <Icon name="fileCode" className="w-3 h-3 mr-2 text-[var(--accent)]" />
                      <span className="text-sm">welcome.md</span>
                    </div>
                  </Link>
                  <Link href="/about">
                    <div className={cn(
                      "flex items-center px-3 py-1 cursor-pointer hover:bg-white/10 rounded text-[var(--text-primary)]",
                      pathname === "/about" && "bg-white/5 font-medium"
                    )}>
                      <Icon name="fileCode" className="w-3 h-3 mr-2 text-[var(--accent)]" />
                      <span className="text-sm">about.md</span>
                    </div>
                  </Link>
              </>
            }
          />

          {/* POSTS SECTION */}
          <NavItem href="/posts" icon="posts" label="POSTS" count={postCount} />

          {/* PROJECTS SECTION */}
          <NavItem href="/projects" icon="folder" label="PROJECTS" count={projectCount} />

          {/* TAGS SECTION */}
          <NavItem href="/tags" icon="tags" label="TAGS" />

        </div>
      </div>

      <div className="p-3 border-t border-[var(--border-color)] shrink-0">
        <UserProfile />
      </div>
    </aside>
  );
};
