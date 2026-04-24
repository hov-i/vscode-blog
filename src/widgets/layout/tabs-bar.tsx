"use client";

import { Icon, IconKey } from "@/shared/ui/icon";
import { usePathname } from "next/navigation";

export const TabsBar = () => {
  const pathname = usePathname();

  const getTabInfo = (path: string): { name: string; icon: IconKey } => {
    const segments = path.split("/").filter(Boolean);

    if (segments.length === 0) return { name: "home.jsx", icon: "home" };

    const [root, ...rest] = segments;
    const leaf = rest.length > 0 ? decodeURIComponent(rest[rest.length - 1]) : null;

    switch (root) {
      case "posts":
        return leaf
          ? { name: `${leaf}.md`, icon: "fileCode" }
          : { name: "posts.json", icon: "posts" };
      case "projects":
        return leaf
          ? { name: `${leaf}.json`, icon: "fileCode" }
          : { name: "projects.json", icon: "folder" };
      case "tags":
        return leaf
          ? { name: `${leaf}.json`, icon: "tags" }
          : { name: "tags.json", icon: "tags" };
      case "about":
        return { name: "about.md", icon: "user" };
      case "guestbook":
        return { name: "guestbook.md", icon: "messageSquare" };
      case "admin":
        return { name: "admin.config", icon: "settings" };
      case "auth":
        return { name: "auth.login", icon: "logIn" };
      default:
        return { name: `${root}.tsx`, icon: "fileCode" };
    }
  };

  const currentTab = getTabInfo(pathname);

  return (
    <div
      id="tabs-bar"
      className="flex items-center h-9 bg-[var(--vscode-tab-inactive-bg)]"
    >
      <div className="flex items-center px-3 h-full cursor-pointer bg-[var(--vscode-tab-active-bg)] border-r border-[var(--vscode-tab-border)] border-t-2 border-t-[var(--accent)] -mt-px">
        <Icon name={currentTab.icon} className="w-4 h-4 mr-2 text-[var(--accent)]" />
        <span className="text-xs mr-3 text-[var(--vscode-tab-active-fg)]">{currentTab.name}</span>
        <button className="hover:bg-[var(--vscode-hover-bg)] p-1 rounded text-[var(--vscode-tab-inactive-fg)]">
          <Icon name="close" className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
