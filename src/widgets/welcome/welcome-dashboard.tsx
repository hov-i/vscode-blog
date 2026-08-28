"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSetPostMeta } from "@/widgets/layout/post-meta-context";

const UI_FONT = "'Segoe UI Variable','Segoe UI Variable Display','Segoe UI',system-ui,sans-serif";
const MONO_FONT = "Consolas,'Cascadia Mono','Segoe UI Mono',Menlo,monospace";

export type WelcomeStats = {
  postCount: number;
  projectCount: number;
  tagCount: number;
  totalViews: number;
};

export type RecentPost = {
  id: number;
  title: string;
  description: string | null;
  // unstable_cache round-trips its return value through JSON, so Date
  // fields come back as ISO strings on cache hits — accept both.
  createdAt: Date | string;
  views: number;
  commentsCount: number;
  tags: { id: number; name: string }[];
};

export type FeaturedProject = {
  id: number;
  title: string;
  description: string | null;
  tags: { id: number; name: string }[];
};

function formatViews(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function formatDate(date: Date | string): string {
  return new Date(date)
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

const cardStyle: React.CSSProperties = {
  borderRadius: 6,
  background: "rgb(41,43,47)",
  boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
  padding: "16px 18px",
};

export function WelcomeDashboard({
  stats,
  recentPosts,
  featuredProjects,
}: {
  stats: WelcomeStats;
  recentPosts: RecentPost[];
  featuredProjects: FeaturedProject[];
}) {
  const setPostMeta = useSetPostMeta();

  useEffect(() => {
    setPostMeta({ path: "home/welcome.md", wordCount: 0 });
    return () => setPostMeta(null);
  }, [setPostMeta]);

  const statItems = [
    { label: "Total Posts", value: String(stats.postCount) },
    { label: "Projects", value: String(stats.projectCount) },
    { label: "Tags", value: String(stats.tagCount) },
    { label: "Page Views", value: formatViews(stats.totalViews) },
  ];

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
        gap: 32,
      }}
    >
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, font: `600 30px/38px ${UI_FONT}`, color: "rgb(255,255,255)", letterSpacing: "-.01em" }}>
          안녕하세요, 윤홍비입니다
        </h1>
        <p style={{ margin: "6px 0 0", font: `400 15px/22px ${UI_FONT}`, color: "rgb(196,196,196)" }}>Frontend Developer</p>
      </div>

      {/* Quick stats */}
      <div>
        <div style={{ font: `600 11px/1 ${MONO_FONT}`, letterSpacing: ".06em", color: "rgba(255,255,255,.5)", marginBottom: 12 }}>
          {"// QUICK STATS"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {statItems.map((item) => (
            <div key={item.label} style={cardStyle}>
              <div style={{ font: `600 26px/1 ${UI_FONT}`, color: "rgb(96,205,255)" }}>{item.value}</div>
              <div style={{ marginTop: 6, font: `400 12px/1 ${UI_FONT}`, color: "rgb(196,196,196)" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div>
          <h2 style={{ margin: "0 0 12px", font: `600 18px/24px ${UI_FONT}`, color: "rgb(255,255,255)" }}>Recent Posts</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                style={{ ...cardStyle, display: "block", textDecoration: "none" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ font: `600 15px/22px ${UI_FONT}`, color: "rgb(255,255,255)" }}>{post.title}</span>
                  {post.tags[0] && (
                    <span
                      style={{
                        flex: "none",
                        font: `400 11px/1 ${MONO_FONT}`,
                        color: "rgb(96,205,255)",
                        background: "rgba(96,205,255,0.12)",
                        borderRadius: 3,
                        padding: "3px 6px",
                      }}
                    >
                      {post.tags[0].name}
                    </span>
                  )}
                </div>
                {post.description && (
                  <p
                    style={{
                      margin: "6px 0 0",
                      font: `400 13px/19px ${UI_FONT}`,
                      color: "rgb(196,196,196)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {post.description}
                  </p>
                )}
                <div style={{ marginTop: 8, display: "flex", gap: 12, font: `400 12px/1 ${MONO_FONT}`, color: "rgba(255,255,255,.4)" }}>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>{post.views} views</span>
                  <span>{post.commentsCount} comments</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured projects */}
      {featuredProjects.length > 0 && (
        <div>
          <h2 style={{ margin: "0 0 12px", font: `600 18px/24px ${UI_FONT}`, color: "rgb(255,255,255)" }}>Featured Projects</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                style={{ ...cardStyle, display: "block", textDecoration: "none" }}
              >
                <div style={{ font: `600 15px/22px ${UI_FONT}`, color: "rgb(255,255,255)" }}>{project.title}</div>
                {project.description && (
                  <p style={{ margin: "6px 0 0", font: `400 13px/19px ${UI_FONT}`, color: "rgb(196,196,196)" }}>{project.description}</p>
                )}
                {project.tags.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {project.tags.map((tag) => (
                      <span
                        key={tag.id}
                        style={{
                          font: `400 11px/1 ${MONO_FONT}`,
                          color: "rgb(196,196,196)",
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: 3,
                          padding: "3px 6px",
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
