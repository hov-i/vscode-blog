"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { FileMeta } from "@/widgets/layout/file-tree-data";

export type OpenTab = FileMeta;

function fileForPathname(pathname: string, files: FileMeta[]): FileMeta | null {
  return files.find((f) => f.route === pathname) ?? null;
}

// Tabs mirror the current route rather than owning their own "open" state —
// the URL is the source of truth so direct links, refreshes, and the
// browser's back/forward button all keep the tab bar in sync automatically.
export function useOpenTabs(files: FileMeta[]) {
  const pathname = usePathname();
  const router = useRouter();

  const initialFile = fileForPathname(pathname, files);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>(initialFile ? [initialFile] : []);
  const [activeFileId, setActiveFileId] = useState(initialFile?.id ?? "");

  // Derives tab state from the route on every navigation (direct link, back/
  // forward, sidebar/tab clicks) — the URL is the source of truth here.
  useEffect(() => {
    const file = fileForPathname(pathname, files);
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveFileId("");
      return;
    }
    setOpenTabs((tabs) => (tabs.some((t) => t.id === file.id) ? tabs : [...tabs, file]));
    setActiveFileId(file.id);
  }, [pathname, files]);

  function openFile(file: FileMeta) {
    router.push(file.route);
  }

  function selectTab(id: string) {
    const file = files.find((f) => f.id === id);
    if (file) router.push(file.route);
  }

  // Closing the last tab with no neighbor to fall back to leaves openTabs
  // empty — VSCodeLayout shows an empty-editor placeholder in that case,
  // matching real VSCode rather than forcing a navigation back to "/".
  //
  // router.push/setActiveFileId run here, in the event handler itself —
  // not inside the setOpenTabs updater — since updater functions can run
  // during React's render phase and must stay pure (no side effects).
  function closeTab(id: string) {
    const idx = openTabs.findIndex((t) => t.id === id);
    if (idx === -1) return;

    const next = openTabs.filter((t) => t.id !== id);
    setOpenTabs(next);

    if (activeFileId === id) {
      const neighbor = next[idx - 1] ?? next[idx] ?? null;
      if (neighbor) {
        router.push(neighbor.route);
      } else {
        setActiveFileId("");
      }
    }
  }

  function reorderTabs(fromIndex: number, toIndex: number) {
    setOpenTabs((tabs) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= tabs.length || toIndex >= tabs.length) {
        return tabs;
      }
      const next = [...tabs];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  return { openTabs, activeFileId, openFile, selectTab, closeTab, reorderTabs };
}
