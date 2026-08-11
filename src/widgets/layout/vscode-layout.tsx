"use client";

import { ActivityBar } from "@/widgets/layout/activity-bar";
import { Sidebar } from "@/widgets/layout/sidebar";
import { StatusBar } from "@/widgets/layout/status-bar";
import { TabsBar } from "@/widgets/layout/tabs-bar";
import { BreadcrumbBar } from "@/widgets/layout/breadcrumb-bar";
import { ReactNode, useState, useEffect, useRef } from "react";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/utils";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// 챗 위젯은 초기 렌더에 필요 없으므로 지연 로딩 (framer-motion 등 무거운 의존성 포함)
const ChatWidget = dynamic(
  () => import("@/widgets/chat-widget/chat-widget").then((m) => m.ChatWidget),
  { ssr: false }
);

const LINE_HEIGHT_PX = 24;

export const VSCodeLayout = ({ children, postCount, projectCount }: { children: ReactNode; postCount: number; projectCount: number }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [lineCount, setLineCount] = useState(30);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Dynamically size the line-number gutter based on content height
  useEffect(() => {
    const content = contentRef.current;
    const scroller = scrollRef.current;
    if (!content || !scroller) return;

    const update = () => {
      const contentHeight = content.getBoundingClientRect().height;
      const viewportHeight = scroller.clientHeight;
      const height = Math.max(contentHeight, viewportHeight);
      const lines = Math.max(30, Math.ceil(height / LINE_HEIGHT_PX) + 2);
      setLineCount(lines);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(content);
    ro.observe(scroller);
    return () => ro.disconnect();
  }, [pathname]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Main Flex Area */}
      <div className="flex flex-1 overflow-hidden relative">
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

        {/* Navigation Sidebar Area - Hidden on Mobile, shown via sidebar state if needed */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full lg:relative lg:inset-auto lg:flex transition-transform duration-300 transform outline-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <ActivityBar />
          <Sidebar
            postCount={postCount}
            projectCount={projectCount}
            onClose={() => setSidebarOpen(false)}
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
        <main id="main-content" className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <TabsBar />
          <BreadcrumbBar />

          <div ref={scrollRef} className="flex flex-1 overflow-y-auto bg-[var(--bg-primary)]">
            {/* Line Numbers Gutter - scrolls with content */}
            <div
              aria-hidden="true"
              className="hidden sm:block w-12 py-2 text-right px-2 text-xs font-mono text-[var(--text-secondary)] shrink-0 select-none"
              style={{ lineHeight: `${LINE_HEIGHT_PX}px` }}
            >
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Content column (natural height; outer flex stretches this to match gutter) */}
            <div className="flex-1 min-w-0 flex flex-col text-[var(--text-editor)]">
              <div
                ref={contentRef}
                key={pathname}
                className="p-4 sm:p-6 animate-fade-in"
              >
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      <StatusBar />
      <ChatWidget />
    </div>
  );
};
