"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { ZOOM_SCALE } from "@/shared/lib/ui/zoom-scale";
import { useSetPostMeta } from "@/widgets/layout/post-meta-context";

const UI_FONT = "'Segoe UI Variable','Segoe UI Variable Display','Segoe UI',system-ui,sans-serif";
const MONO_FONT = "Consolas,'Cascadia Mono','Segoe UI Mono',Menlo,monospace";

const DEFAULT_PREVIEW_WIDTH = 1000;
const MIN_PREVIEW_WIDTH = 320;
const MIN_SOURCE_WIDTH = 320;
const HANDLE_WIDTH = 8;

// A generic markdown "document" the split view can render — a real post or
// project, or a static page like welcome.md / about.md.
export type DocContent = {
  title: string;
  path: string;
  content: string;
};

function countWords(content: string): number {
  const trimmed = content.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function Chevron() {
  return (
    <svg width="5" height="10" viewBox="0 0 5 10" fill="none" style={{ display: "block", flex: "none" }}>
      <path d="M 0.8 0.8 L 4.2 5 L 0.8 9.2" stroke="rgba(249,249,249,0.5)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 style={{ margin: "0 0 16px", font: `600 30px/38px ${UI_FONT}`, color: "rgb(255,255,255)", letterSpacing: "-.01em" }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ margin: "22px 0 16px", font: `600 22px/28px ${UI_FONT}`, color: "rgb(255,255,255)" }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ margin: "18px 0 12px", font: `600 18px/24px ${UI_FONT}`, color: "rgb(255,255,255)" }}>{children}</h3>
  ),
  p: ({ children }) => <p style={{ margin: "0 0 16px", font: `400 16px/26px ${UI_FONT}`, color: "rgb(249,249,249)" }}>{children}</p>,
  strong: ({ children }) => <strong style={{ fontWeight: 600, color: "rgb(255,255,255)" }}>{children}</strong>,
  ul: ({ children }) => (
    <ul style={{ margin: "0 0 16px", padding: "0 0 0 20px", display: "flex", flexDirection: "column", gap: 7, font: `400 16px/26px ${UI_FONT}`, color: "rgb(249,249,249)" }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: "0 0 16px", padding: "0 0 0 20px", display: "flex", flexDirection: "column", gap: 7, font: `400 16px/26px ${UI_FONT}`, color: "rgb(249,249,249)" }}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <div style={{ margin: "0 0 16px", padding: "2px 0 2px 14px", boxShadow: "inset 3px 0 0 0 rgb(96,205,255)" }}>
      <div style={{ font: `400 16px/26px ${UI_FONT}`, color: "rgb(196,196,196)", fontStyle: "italic" }}>{children}</div>
    </div>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" style={{ color: "rgb(96,205,255)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
      {children}
    </a>
  ),
  img: ({ src, alt, width, height, style }) => (
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      width={width}
      height={height}
      // Raw <img width/height/style> (e.g. the about.md avatar) overrides the
      // default full-width treatment used for post/project content images.
      style={{ maxWidth: "100%", borderRadius: 4, ...(typeof style === "object" ? style : {}) }}
    />
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? "");
    if (!isBlock) {
      return (
        <code style={{ fontFamily: MONO_FONT, fontSize: 14, background: "rgb(49,51,55)", padding: "1px 5px", borderRadius: 3, color: "rgb(119,243,255)" }}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} style={{ fontFamily: MONO_FONT, fontWeight: 400, fontSize: 13, lineHeight: "18px" }}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre style={{ margin: "0 0 16px", borderRadius: 4, background: "rgb(49,51,55)", padding: "12px 14px", overflowX: "auto" }}>{children}</pre>
  ),
  table: ({ children }) => (
    <div style={{ margin: "0 0 16px", overflowX: "auto", borderRadius: 4, boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", font: `400 13px/20px ${UI_FONT}`, color: "rgb(249,249,249)" }}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{children}</tr>,
  th: ({ children }) => (
    <th style={{ textAlign: "left", padding: "8px 12px", font: `600 12px/1 ${UI_FONT}`, color: "rgb(255,255,255)", background: "rgb(49,51,55)", whiteSpace: "nowrap" }}>
      {children}
    </th>
  ),
  td: ({ children }) => <td style={{ padding: "8px 12px", verticalAlign: "top" }}>{children}</td>,
};

export function DocPreviewSplit({ doc }: { doc: DocContent }) {
  const [previewWidth, setPreviewWidth] = useState(DEFAULT_PREVIEW_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const setPostMeta = useSetPostMeta();

  const breadcrumb = doc.path.split("/");
  const lines = doc.content.split("\n");
  const gutterLines = lines.map((_, i) => String(i + 1).padStart(2, "0"));

  useEffect(() => {
    setPostMeta({ path: doc.path, wordCount: countWords(doc.content) });
    return () => setPostMeta(null);
  }, [doc.path, doc.content, setPostMeta]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragRef.current || !containerRef.current) return;
      const { startX, startWidth } = dragRef.current;
      const deltaX = (e.clientX - startX) / ZOOM_SCALE;
      const containerWidth = containerRef.current.getBoundingClientRect().width / ZOOM_SCALE;
      const maxWidth = containerWidth - HANDLE_WIDTH - MIN_SOURCE_WIDTH;
      const next = Math.min(maxWidth, Math.max(MIN_PREVIEW_WIDTH, startWidth + deltaX));
      setPreviewWidth(next);
    }
    function handleMouseUp() {
      dragRef.current = null;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  function handleResizeStart(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: previewWidth };
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  return (
    <div ref={containerRef} style={{ display: "flex", height: "100%" }}>
      {/* preview */}
      <div
        style={{
          width: previewWidth,
          flex: "none",
          borderRadius: 7,
          background: "var(--bg-secondary)",
          boxShadow: "0 0 0 1px rgba(0,0,0,.1622)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ height: 34, flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
          <span style={{ font: `600 12px/1 ${UI_FONT}`, color: "rgb(255,255,255)", letterSpacing: ".06em", textTransform: "uppercase" }}>Preview</span>
          <span style={{ marginLeft: "auto", font: `400 12px/1 ${MONO_FONT}`, color: "rgb(96,205,255)" }}>locked to source</span>
        </div>
        <div style={{ padding: "22px 24px 26px", overflowY: "auto" }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]} components={markdownComponents}>
            {doc.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* resize handle */}
      <div
        className={`vertical-resize-handle${isResizing ? " dragging" : ""}`}
        onMouseDown={handleResizeStart}
        style={{ flex: "none", width: HANDLE_WIDTH, position: "relative", cursor: "col-resize" }}
      />

      {/* source / code */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          borderRadius: 7,
          background: "var(--bg-secondary)",
          boxShadow: "0 0 0 1px rgba(0,0,0,.1622)",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 16,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 12, flex: "none", display: "flex", flexDirection: "row", alignItems: "center", padding: 0, gap: 6 }}>
          {breadcrumb.map((segment, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: UI_FONT, fontWeight: 400, fontSize: 12, lineHeight: "12px", color: "#FFFFFF", whiteSpace: "nowrap" }}>{segment}</span>
              {i < breadcrumb.length - 1 && <Chevron />}
            </span>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 0, alignSelf: "stretch", display: "flex", flexDirection: "row", alignItems: "flex-start", padding: 0, gap: 8, position: "relative", overflowY: "auto" }}>
          <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", padding: 0 }}>
            {gutterLines.map((n, i) => (
              <span key={i} style={{ height: 18, fontFamily: MONO_FONT, fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "rgba(249,249,249,0.5)" }}>
                {n}
              </span>
            ))}
          </div>

          <div style={{ flex: 1, minWidth: 0, fontFamily: MONO_FONT, fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "#E1E4E8" }}>
            {lines.map((line, i) => (
              <div key={i} style={{ height: 18, whiteSpace: "pre" }}>
                {line || " "}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
