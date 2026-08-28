"use client";

import { usePostMeta } from "@/widgets/layout/post-meta-context";

const UI_FONT = "'Segoe UI Variable','Segoe UI',system-ui,sans-serif";
const W = "#FFFFFF";
const T = "rgb(196,196,196)";
const A = "rgb(96,205,255)";

export const StatusBar = () => {
  const meta = usePostMeta();

  const statusLeft = [
    { label: "main*", fg: W },
    { label: "⊗ 0   ⚠ 0", fg: T },
    { label: meta?.path ?? "no file selected", fg: T },
  ];
  const statusRight = [
    { label: meta ? `${meta.wordCount.toLocaleString()} words` : "—", fg: A },
    { label: "Ln 9, Col 42", fg: T },
    { label: "Spaces: 2", fg: T },
    { label: "UTF-8", fg: T },
    { label: "Markdown", fg: W },
  ];

  return (
    <footer
      id="status-bar"
      className="h-8 mx-2 mb-2 flex items-center rounded-[7px] border border-[var(--vscode-panel-border)] bg-[var(--bg-tertiary)] shrink-0"
      style={{ gap: 20, padding: "0 14px" }}
    >
      {statusLeft.map((s) => (
        <span key={s.label} style={{ font: `400 12px/1 ${UI_FONT}`, color: s.fg, whiteSpace: "nowrap" }}>
          {s.label}
        </span>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
        {statusRight.map((s) => (
          <span key={s.label} style={{ font: `400 12px/1 ${UI_FONT}`, color: s.fg, whiteSpace: "nowrap" }}>
            {s.label}
          </span>
        ))}
      </div>
    </footer>
  );
};
