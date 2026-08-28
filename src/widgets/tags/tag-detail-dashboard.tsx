"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSetPostMeta } from "@/widgets/layout/post-meta-context";

const UI_FONT = "'Segoe UI Variable','Segoe UI Variable Display','Segoe UI',system-ui,sans-serif";

export type TaggedPost = { id: number; title: string; description: string | null };
export type TaggedProject = { id: number; title: string; description: string | null };

const cardStyle: React.CSSProperties = {
  borderRadius: 6,
  background: "rgb(41,43,47)",
  boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
  padding: "16px 18px",
};

export function TagDetailDashboard({
  name,
  posts,
  projects,
}: {
  name: string;
  posts: TaggedPost[];
  projects: TaggedProject[];
}) {
  const setPostMeta = useSetPostMeta();

  useEffect(() => {
    setPostMeta({ path: `tags/${name}.json`, wordCount: posts.length + projects.length });
    return () => setPostMeta(null);
  }, [setPostMeta, name, posts.length, projects.length]);

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
        <Link href="/tags" style={{ font: `400 12px/1 ${UI_FONT}`, color: "rgb(96,205,255)", textDecoration: "none" }}>
          ← 전체 태그
        </Link>
        <h1 style={{ margin: "8px 0 0", font: `600 26px/34px ${UI_FONT}`, color: "rgb(255,255,255)", letterSpacing: "-.01em" }}>#{name}</h1>
        <p style={{ margin: "6px 0 0", font: `400 14px/20px ${UI_FONT}`, color: "rgb(196,196,196)" }}>
          게시물 {posts.length}개, 프로젝트 {projects.length}개
        </p>
      </div>

      {posts.length > 0 && (
        <div>
          <h2 style={{ margin: "0 0 12px", font: `600 18px/24px ${UI_FONT}`, color: "rgb(255,255,255)" }}>Posts</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} style={{ ...cardStyle, display: "block", textDecoration: "none" }}>
                <div style={{ font: `600 15px/22px ${UI_FONT}`, color: "rgb(255,255,255)" }}>{post.title}</div>
                {post.description && (
                  <p style={{ margin: "6px 0 0", font: `400 13px/19px ${UI_FONT}`, color: "rgb(196,196,196)" }}>{post.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <h2 style={{ margin: "0 0 12px", font: `600 18px/24px ${UI_FONT}`, color: "rgb(255,255,255)" }}>Projects</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} style={{ ...cardStyle, display: "block", textDecoration: "none" }}>
                <div style={{ font: `600 15px/22px ${UI_FONT}`, color: "rgb(255,255,255)" }}>{project.title}</div>
                {project.description && (
                  <p style={{ margin: "6px 0 0", font: `400 13px/19px ${UI_FONT}`, color: "rgb(196,196,196)" }}>{project.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && projects.length === 0 && (
        <div style={{ ...cardStyle, textAlign: "center", color: "rgba(255,255,255,.5)", font: `400 13px/20px ${UI_FONT}` }}>
          이 태그가 달린 글이나 프로젝트가 없습니다.
        </div>
      )}
    </div>
  );
}
