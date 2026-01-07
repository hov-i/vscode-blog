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
      className="w-12 flex flex-col items-center bg-[var(--bg-tertiary)] border-r border-[var(--border-color)] shrink-0"
    >
      <div className="w-full h-12 flex items-center justify-center border-b border-[var(--border-color)]">
        <Icon name="logo" className="text-lg text-[var(--accent)]" />
      </div>
      <button className="w-full h-12 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10">
        <Icon name="menu" />
      </button>
      
      <Link href="/" className={cn("w-full h-12 flex items-center justify-center hover:bg-white/10 relative", isActive("/") ? "text-[var(--accent)]" : "text-[var(--text-secondary)]")}>
        {isActive("/") && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)]" />}
        <Icon name="home" />
      </Link>
      
      <Link href="/posts" className={cn("w-full h-12 flex items-center justify-center hover:bg-white/10 relative", isActive("/posts") ? "text-[var(--accent)]" : "text-[var(--text-secondary)]")}>
        {isActive("/posts") && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)]" />}
        <Icon name="posts" />
      </Link>

      <Link href="/projects" className={cn("w-full h-12 flex items-center justify-center hover:bg-white/10 relative", isActive("/projects") ? "text-[var(--accent)]" : "text-[var(--text-secondary)]")}>
        {isActive("/projects") && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)]" />}
        <Icon name="folder" />
      </Link>

      <Link href="/tags" className={cn("w-full h-12 flex items-center justify-center hover:bg-white/10 relative", isActive("/tags") ? "text-[var(--accent)]" : "text-[var(--text-secondary)]")}>
        {isActive("/tags") && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)]" />}
        <Icon name="tags" />
      </Link>

      <Link href="/about" className={cn("w-full h-12 flex items-center justify-center hover:bg-white/10 relative", isActive("/about") ? "text-[var(--accent)]" : "text-[var(--text-secondary)]")}>
         {isActive("/about") && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--accent)]" />}
        <Icon name="user" />
      </Link>

      <div className="mt-auto mb-4 w-full flex flex-col items-center">
        <button
          onClick={toggleTheme}
          id="theme-toggle"
          className="w-full h-12 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10"
        >
          {mounted && theme === "light" ? <Icon name="sun" /> : <Icon name="moon" />}
        </button>
        <button className="w-full h-12 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10">
          <Icon name="settings" />
        </button>
      </div>
    </aside>
  );
};
