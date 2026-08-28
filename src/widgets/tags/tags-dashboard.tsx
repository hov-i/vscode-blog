"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSetPostMeta } from "@/widgets/layout/post-meta-context";

const UI_FONT = "'Segoe UI Variable','Segoe UI Variable Display','Segoe UI',system-ui,sans-serif";
const MONO_FONT = "Consolas,'Cascadia Mono','Segoe UI Mono',Menlo,monospace";

export type TagSummary = { id: number; name: string; count: number };

export function TagsDashboard({ tags }: { tags: TagSummary[] }) {
  const setPostMeta = useSetPostMeta();

  useEffect(() => {
    setPostMeta({ path: "tags.json", wordCount: tags.length });
    return () => setPostMeta(null);
  }, [setPostMeta, tags.length]);

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        borderRadius: 7,
        background: "var(--bg-secondary)",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1622)",
        padding: "28px 32px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div>
        <h1 style={{ margin: 0, font: `600 26px/34px ${UI_FONT}`, color: "rgb(255,255,255)", letterSpacing: "-.01em" }}>Tags</h1>
        <p style={{ margin: "6px 0 0", font: `400 14px/20px ${UI_FONT}`, color: "rgb(196,196,196)" }}>{tags.length}개의 태그</p>
      </div>

      {tags.length === 0 ? (
        <div
          style={{
            borderRadius: 6,
            background: "rgb(41,43,47)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
            padding: "16px 18px",
            textAlign: "center",
            color: "rgba(255,255,255,.5)",
            font: `400 13px/20px ${UI_FONT}`,
          }}
        >
          아직 등록된 태그가 없습니다.
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 6,
                background: "rgb(41,43,47)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
                textDecoration: "none",
              }}
            >
              <span style={{ font: `600 13px/1 ${UI_FONT}`, color: "rgb(255,255,255)" }}>{tag.name}</span>
              <span
                style={{
                  font: `400 11px/1 ${MONO_FONT}`,
                  color: "rgb(96,205,255)",
                  background: "rgba(96,205,255,0.12)",
                  borderRadius: 999,
                  padding: "2px 7px",
                }}
              >
                {tag.count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
