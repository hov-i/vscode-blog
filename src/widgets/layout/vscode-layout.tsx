"use client";

import { ActivityBar } from "@/widgets/layout/activity-bar";
import { Sidebar } from "@/widgets/layout/sidebar";
import { StatusBar } from "@/widgets/layout/status-bar";
import { TabsBar } from "@/widgets/layout/tabs-bar";
import { TitleBar } from "@/widgets/layout/title-bar";
import { TerminalDock } from "@/widgets/layout/terminal-dock";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/utils";
import { useOpenTabs } from "@/widgets/layout/use-open-tabs";
import { buildAllFiles, GUESTBOOK_FILE, type PostSummary, type ProjectSummary, type TagSummary } from "@/widgets/layout/file-tree-data";
import { PostMetaProvider } from "@/widgets/layout/post-meta-context";
import { EmptyEditorState } from "@/widgets/layout/empty-editor-state";

export const VSCodeLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isTerminalOpen, setTerminalOpen] = useState(true);
  const [sidebarView, setSidebarView] = useState<"explorer" | "search">("explorer");
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [tags, setTags] = useState<TagSummary[]>([]);
  const files = useMemo(() => buildAllFiles({ posts, projects, tags }), [posts, projects, tags]);
  const { openTabs, activeFileId, openFile, selectTab, closeTab, reorderTabs, showEmptyState } = useOpenTabs(files);

  // The Explorer/Search sidebar's data has no bearing on the page content
  // itself (which is already server-rendered via `children`), so it's fetched
  // client-side after mount rather than through the root layout — keeping
  // DB reads out of the shared layout lets routes like /about and
  // /projects/[id] regain static/cached rendering instead of being forced
  // dynamic on every request just to feed the file tree.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/sidebar-data")
      .then((res) => res.json())
      .then((data: { posts: PostSummary[]; projects: ProjectSummary[]; tags: TagSummary[] }) => {
        if (cancelled) return;
        setPosts(data.posts);
        setProjects(data.projects);
        setTags(data.tags);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleToggleSearch() {
    setSidebarView((v) => (v === "search" ? "explorer" : "search"));
  }

  function handleOpenGuestbook() {
    setSidebarView("explorer");
    openFile(GUESTBOOK_FILE);
  }

  // Mobile starts with the sidebar collapsed (it renders as a full overlay there);
  // desktop keeps the default-open state set above.
  useEffect(() => {
    if (window.innerWidth < 1024) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSidebarOpen(false);
    }
  }, []);

  return (
    <PostMetaProvider>
      <div className="flex h-[111.112vh] w-[111.112vw] origin-top-left scale-90 flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <TitleBar
          terminalOpen={isTerminalOpen}
          onToggleTerminal={() => setTerminalOpen((v) => !v)}
          sidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        {/* Main Flex Area — window base (Mica panels float on top with gaps) */}
        <div className="flex flex-1 overflow-hidden relative bg-[var(--bg-secondary)]">
          {/* Mobile Toggle Button — 열려 있을 땐 사이드바 자체 닫기 버튼 사용 */}
          {!isSidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden fixed bottom-10 left-6 z-30 w-12 h-12 rounded-full bg-[var(--accent)] text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              aria-label="메뉴 열기"
            >
              <Icon name="menu" className="w-6 h-6" />
            </button>
          )}

          {/* Navigation Sidebar Area — slides in/out on mobile, collapses to 0 width on desktop */}
          <div className={cn(
            "fixed inset-y-0 left-0 z-40 flex lg:relative lg:inset-auto lg:my-2 transition-all duration-300 outline-none overflow-hidden",
            isSidebarOpen
              ? "translate-x-0 lg:w-auto lg:ml-2 lg:gap-2"
              : "-translate-x-full lg:translate-x-0 lg:w-0 lg:ml-0 lg:gap-0"
          )}>
            <ActivityBar
              sidebarView={sidebarView}
              activeFileId={activeFileId}
              onToggleSearch={handleToggleSearch}
              onOpenGuestbook={handleOpenGuestbook}
            />
            <Sidebar
              onClose={() => setSidebarOpen(false)}
              posts={posts}
              projects={projects}
              activeFileId={activeFileId}
              onOpenFile={openFile}
              sidebarView={sidebarView}
            />
          </div>

          {/* Overlay for Mobile Sidebar */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Editor Area */}
          <main id="main-content" className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden lg:my-2 lg:mr-2 lg:ml-2">
            <TabsBar
              tabs={openTabs}
              activeFileId={activeFileId}
              onSelect={selectTab}
              onClose={closeTab}
              onReorder={reorderTabs}
            />

            <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
              {/* page.tsx supplies its own Mica-carded preview/source split;
                  once the user explicitly closes every tab we show an
                  empty-editor placeholder instead — gated on showEmptyState,
                  not openTabs.length, so children (already server-rendered)
                  stay visible while the sidebar's file list is still loading */}
              <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
                {showEmptyState ? <EmptyEditorState onOpenFile={openFile} /> : children}
              </div>

              {isTerminalOpen && <TerminalDock />}
            </div>
          </main>
        </div>

        <StatusBar />
      </div>
    </PostMetaProvider>
  );
};
