"use client";

import { ActivityBar } from "@/widgets/layout/activity-bar";
import { Sidebar } from "@/widgets/layout/sidebar";
import { StatusBar } from "@/widgets/layout/status-bar";
import { TabsBar } from "@/widgets/layout/tabs-bar";
import { ReactNode } from "react";

export const VSCodeLayout = ({ children, postCount, projectCount }: { children: ReactNode; postCount: number; projectCount: number }) => {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Main Flex Area */}
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        <Sidebar postCount={postCount} projectCount={projectCount} />

        {/* Editor Area */}
        <main id="main-content" className="flex-1 flex flex-col min-w-0">
          <TabsBar />

          <div className="flex flex-1 overflow-hidden">
            {/* Line Numbers Sidebar (Visual only) */}
            <div className="w-12 py-2 text-right px-2 text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-r border-[var(--border-color)] shrink-0 select-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Content Children */}
            <div className="flex-1 p-6 overflow-y-auto bg-[var(--bg-primary)]">
                {children}
            </div>
          </div>
        </main>
      </div>

      <StatusBar />
    </div>
  );
};
