"use client";

import { ActivityBar } from "@/widgets/layout/activity-bar";
import { Sidebar } from "@/widgets/layout/sidebar";
import { StatusBar } from "@/widgets/layout/status-bar";
import { TabsBar } from "@/widgets/layout/tabs-bar";
import { TitleBar } from "@/widgets/layout/title-bar";
import { TerminalDock } from "@/widgets/layout/terminal-dock";
import { ReactNode, useState } from "react";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/utils";

export const VSCodeLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isTerminalOpen, setTerminalOpen] = useState(true);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <TitleBar terminalOpen={isTerminalOpen} onToggleTerminal={() => setTerminalOpen((v) => !v)} />
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

        {/* Navigation Sidebar Area - Hidden on Mobile, shown via sidebar state if needed */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-40 flex lg:relative lg:inset-auto lg:my-2 lg:ml-2 lg:gap-2 transition-transform duration-300 transform outline-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <ActivityBar />
          <Sidebar onClose={() => setSidebarOpen(false)} />
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
          <TabsBar />

          <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
            {/* page.tsx supplies its own Mica-carded preview/source split */}
            <div className="flex-1 min-w-0 min-h-0 overflow-hidden">{children}</div>

            {isTerminalOpen && <TerminalDock />}
          </div>
        </main>
      </div>

      <StatusBar />
    </div>
  );
};
