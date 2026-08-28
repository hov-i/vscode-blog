"use client";

import { ABOUT_FILE, WELCOME_FILE, type FileMeta } from "@/widgets/layout/file-tree-data";

const UI_FONT = "'Segoe UI Variable','Segoe UI',system-ui,sans-serif";
const MONO_FONT = "Consolas,'Cascadia Mono',Menlo,monospace";

// Shown in place of the editor area once every tab is closed — mirrors real
// VSCode's empty editor group (faint logo + a short list of quick actions)
// instead of forcing the user back to a specific file.
export const EmptyEditorState = ({ onOpenFile }: { onOpenFile: (file: FileMeta) => void }) => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        color: "rgba(255,255,255,.5)",
      }}
    >
      <img src="/icons/app-icon.png" alt="" style={{ width: 64, height: 64, opacity: 0.18, display: "block" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => onOpenFile(WELCOME_FILE)}
          style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}
        >
          <span style={{ font: `400 13px/1 ${UI_FONT}`, color: "rgb(96,205,255)" }}>Show Welcome</span>
          <span style={{ font: `400 12px/1 ${MONO_FONT}`, color: "rgba(255,255,255,.3)" }}>welcome.md</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenFile(ABOUT_FILE)}
          style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}
        >
          <span style={{ font: `400 13px/1 ${UI_FONT}`, color: "rgb(96,205,255)" }}>Show About</span>
          <span style={{ font: `400 12px/1 ${MONO_FONT}`, color: "rgba(255,255,255,.3)" }}>about.md</span>
        </button>
      </div>
    </div>
  );
};
