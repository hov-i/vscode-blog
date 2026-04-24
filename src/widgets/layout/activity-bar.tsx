"use client";

import { useTheme } from "next-themes";
import { Icon } from "@/shared/ui/icon";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";

export const ActivityBar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      id="activity-bar"
      className="w-12 lg:flex hidden flex-col items-center bg-[var(--vscode-activity-bar-bg)] border-r border-[var(--border-color)] shrink-0"
    >
      <div className="w-full h-12 flex items-center justify-center">
        <Icon name="logo" className="text-lg text-[var(--vscode-activity-bar-fg)]" />
      </div>

      <Link href="/" className={cn("w-full h-12 flex items-center justify-center hover:bg-[var(--vscode-hover-bg)] relative", isActive("/") ? "text-[var(--vscode-activity-bar-fg)]" : "text-[var(--vscode-activity-bar-inactive-fg)] hover:text-[var(--vscode-activity-bar-fg)]")}>
        {isActive("/") && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--vscode-activity-bar-fg)]" />}
        <Icon name="home" className="w-6 h-6" />
      </Link>

      <Link href="/posts" className={cn("w-full h-12 flex items-center justify-center hover:bg-[var(--vscode-hover-bg)] relative", isActive("/posts") ? "text-[var(--vscode-activity-bar-fg)]" : "text-[var(--vscode-activity-bar-inactive-fg)] hover:text-[var(--vscode-activity-bar-fg)]")}>
        {isActive("/posts") && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--vscode-activity-bar-fg)]" />}
        <Icon name="posts" className="w-6 h-6" />
      </Link>

      <Link href="/projects" className={cn("w-full h-12 flex items-center justify-center hover:bg-[var(--vscode-hover-bg)] relative", isActive("/projects") ? "text-[var(--vscode-activity-bar-fg)]" : "text-[var(--vscode-activity-bar-inactive-fg)] hover:text-[var(--vscode-activity-bar-fg)]")}>
        {isActive("/projects") && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--vscode-activity-bar-fg)]" />}
        <Icon name="folder" className="w-6 h-6" />
      </Link>

      <Link href="/tags" className={cn("w-full h-12 flex items-center justify-center hover:bg-[var(--vscode-hover-bg)] relative", isActive("/tags") ? "text-[var(--vscode-activity-bar-fg)]" : "text-[var(--vscode-activity-bar-inactive-fg)] hover:text-[var(--vscode-activity-bar-fg)]")}>
        {isActive("/tags") && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--vscode-activity-bar-fg)]" />}
        <Icon name="tags" className="w-6 h-6" />
      </Link>

      <Link href="/about" className={cn("w-full h-12 flex items-center justify-center hover:bg-[var(--vscode-hover-bg)] relative", isActive("/about") ? "text-[var(--vscode-activity-bar-fg)]" : "text-[var(--vscode-activity-bar-inactive-fg)] hover:text-[var(--vscode-activity-bar-fg)]")}>
         {isActive("/about") && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--vscode-activity-bar-fg)]" />}
        <Icon name="user" className="w-6 h-6" />
      </Link>

      <div className="mt-auto mb-2 w-full flex flex-col items-center">
        <button
          onClick={toggleTheme}
          id="theme-toggle"
          title="Toggle theme"
          className="w-full h-12 flex items-center justify-center text-[var(--vscode-activity-bar-inactive-fg)] hover:text-[var(--vscode-activity-bar-fg)] hover:bg-[var(--vscode-hover-bg)]"
        >
          {mounted && theme === "light" ? <Icon name="sun" className="w-6 h-6" /> : <Icon name="moon" className="w-6 h-6" />}
        </button>
        <button className="w-full h-12 flex items-center justify-center text-[var(--vscode-activity-bar-inactive-fg)] hover:text-[var(--vscode-activity-bar-fg)] hover:bg-[var(--vscode-hover-bg)]">
          <Icon name="settings" className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
};
