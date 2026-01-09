"use client";

import { ActivityBar } from "@/widgets/layout/activity-bar";
import { Sidebar } from "@/widgets/layout/sidebar";
import { StatusBar } from "@/widgets/layout/status-bar";
import { TabsBar } from "@/widgets/layout/tabs-bar";
import { ReactNode, useState, useEffect } from "react";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/lib/utils";
import { usePathname } from "next/navigation";

export const VSCodeLayout = ({ children, postCount, projectCount }: { children: ReactNode; postCount: number; projectCount: number }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Main Flex Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-10 right-6 z-50 w-12 h-12 rounded-full bg-[var(--accent)] text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Icon name={isSidebarOpen ? "close" : "menu"} className="w-6 h-6" />
        </button>

        {/* Navigation Sidebar Area - Hidden on Mobile, shown via sidebar state if needed */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-40 lg:relative lg:flex transition-transform duration-300 transform outline-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <ActivityBar />
          <Sidebar postCount={postCount} projectCount={projectCount} />
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

          <div className="flex flex-1 overflow-hidden">
            {/* Line Numbers Sidebar - Hidden on extreme small screens */}
            <div className="hidden sm:block w-12 py-2 text-right px-2 text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-r border-[var(--border-color)] shrink-0 select-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Content Children */}
            <div key={pathname} className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[var(--bg-primary)] h-full animate-fade-in">
                {children}
            </div>
          </div>
        </main>
      </div>

      <StatusBar />
    </div>
  );
};
