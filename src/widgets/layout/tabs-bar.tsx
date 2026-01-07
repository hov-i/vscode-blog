"use client";

import { Icon } from "@/shared/ui/icon";
import { usePathname } from "next/navigation";

export const TabsBar = () => {
  const pathname = usePathname();

  const getTabInfo = (path: string) => {
    switch (path) {
      case "/projects":
        return { name: "projects.json", icon: "folder" };
      case "/tags":
        return { name: "tags.json", icon: "tags" };
      case "/about":
        return { name: "about.md", icon: "user" };
      case "/posts":
        return { name: "posts.json", icon: "posts" };
      default:
        return { name: "home.jsx", icon: "home" };
    }
  };

  const currentTab = getTabInfo(pathname);

  return (
    <div
      id="tabs-bar"
      className="flex items-center h-9 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]"
    >
      <div className="flex items-center px-3 h-full cursor-pointer bg-[var(--bg-primary)] border-r border-[var(--border-color)] border-t-2 border-t-[var(--accent)]">
        <Icon name={currentTab.icon as any} className="w-3 h-3 mr-2 text-[var(--accent)]" />
        <span className="text-xs mr-3 text-[var(--text-primary)]">{currentTab.name}</span>
        <button className="hover:bg-white/10 p-1 rounded text-[var(--text-secondary)]">
          <Icon name="close" className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
