"use client";

import { useState } from "react";
import type { OpenTab } from "@/widgets/layout/use-open-tabs";
import { iconForFile } from "@/widgets/layout/file-tree-data";

const UI_FONT = "'Segoe UI Variable','Segoe UI',system-ui,sans-serif";

interface TabsBarProps {
  tabs: OpenTab[];
  activeFileId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export const TabsBar = ({ tabs, activeFileId, onSelect, onClose, onReorder }: TabsBarProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  function handleDrop() {
    if (dragIndex !== null && dropIndex !== null) onReorder(dragIndex, dropIndex);
    setDragIndex(null);
    setDropIndex(null);
  }

  return (
    <div style={{ position: "relative", height: 40, display: "flex", alignItems: "flex-end", padding: "0 10px 0 0" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "row", alignItems: "flex-end", padding: 0, overflow: "hidden" }}>
        <div style={{ width: 8, flex: "none" }} />
        {tabs.map((tab, i) => {
          const active = tab.id === activeFileId;
          const last = i === tabs.length - 1;
          return (
            <button
              key={tab.id}
              type="button"
              draggable
              onClick={() => onSelect(tab.id)}
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIndex !== null) setDropIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop();
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setDropIndex(null);
              }}
              style={{
                position: "relative",
                width: 160,
                height: 32,
                flex: "none",
                textAlign: "left",
                opacity: dragIndex === i ? 0.4 : 1,
              }}
            >
              {dropIndex === i && dragIndex !== null && dragIndex !== i && (
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    bottom: 2,
                    [dropIndex < dragIndex ? "left" : "right"]: -1,
                    width: 2,
                    background: "var(--vscode-focus-border, #0090f1)",
                    zIndex: 5,
                  }}
                />
              )}
              {active ? (
                <>
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 32, background: "rgba(40,40,40,.75)", borderRadius: "7px 7px 0 0", boxShadow: "inset 1px 1px 0 0 rgba(0,0,0,.1622), inset -1px 0 0 0 rgba(0,0,0,.1622)" }} />
                  <div style={{ position: "absolute", left: 1, right: 1, bottom: -1, height: 2, background: "rgba(40,40,40,.75)" }} />
                </>
              ) : (
                <div className="hover:bg-[rgba(255,255,255,.0605)]" style={{ position: "absolute", left: 1, right: 1, bottom: 1, height: 30, borderRadius: "7px 7px 0 0" }} />
              )}
              <img src={iconForFile(tab.icon, active)} alt="" width={tab.iconSize} height={tab.iconSize} style={{ pointerEvents: "none", position: "absolute", left: 8, top: 8, display: "block" }} />
              <span
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  left: 32,
                  right: 32,
                  top: 5,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: UI_FONT,
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  color: active ? "#FFFFFF" : "rgba(255,255,255,.786)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tab.label}
              </span>
              {!last && (
                <div style={{ pointerEvents: "none", position: "absolute", right: 0, top: 8, width: 1, height: 16, background: "rgba(255,255,255,.0837)" }} />
              )}
              <div
                role="button"
                aria-label={`${tab.label} 닫기`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                className="hover:bg-[rgba(255,255,255,.0605)]"
                style={{ position: "absolute", right: 0, top: 0, width: 40, height: 32, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#FFFFFF" : "rgba(255,255,255,.786)" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: "block" }}>
                  <path d="M2.6 2.6 L9.4 9.4 M9.4 2.6 L2.6 9.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 2, padding: "0 0 4px 10px", color: "rgba(255,255,255,.786)" }}>
        <button type="button" className="w-7 h-6 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,.0605)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" /><rect x="10.5" y="2.5" width="4" height="11" fill="currentColor" /></svg>
        </button>
        <button type="button" className="w-7 h-6 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,.0605)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="4" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="12" cy="8" r="1.3" /></svg>
        </button>
      </div>
    </div>
  );
};
