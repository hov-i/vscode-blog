"use client";

import { useEffect, useState, useTransition } from "react";
import type { User } from "@supabase/supabase-js";
import { getClient } from "@/shared/lib/supabase/client";
import { Icon } from "@/shared/ui/icon";
import { createGuestbook, deleteGuestbook } from "@/shared/lib/actions";
import { useSetPostMeta } from "@/widgets/layout/post-meta-context";

const UI_FONT = "'Segoe UI Variable','Segoe UI Variable Display','Segoe UI',system-ui,sans-serif";
const MONO_FONT = "Consolas,'Cascadia Mono','Segoe UI Mono',Menlo,monospace";

// UI-only hint for showing the delete button — deleteGuestbook enforces the
// real check server-side via ensureAdmin().
const ADMIN_EMAIL = "dbsghdql55555@gmail.com";

export type GuestbookEntry = {
  id: number;
  message: string;
  // unstable_cache round-trips its return value through JSON, so Date
  // fields come back as ISO strings on cache hits — accept both.
  createdAt: Date | string;
  userName: string;
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const cardStyle: React.CSSProperties = {
  borderRadius: 6,
  background: "rgb(41,43,47)",
  boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
  padding: "16px 18px",
};

export function GuestbookDashboard({ entries }: { entries: GuestbookEntry[] }) {
  const setPostMeta = useSetPostMeta();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPostMeta({ path: "home/guestbook.md", wordCount: entries.length });
    return () => setPostMeta(null);
  }, [setPostMeta, entries.length]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    getClient().then((supabase) => {
      if (!active) return;

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  async function handleLogin() {
    const supabase = await getClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    startTransition(async () => {
      await createGuestbook(message);
      setMessage("");
    });
  }

  function handleDelete(id: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteGuestbook(id);
    });
  }

  const isAdmin = user?.email === ADMIN_EMAIL;

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
        <h1 style={{ margin: 0, font: `600 26px/34px ${UI_FONT}`, color: "rgb(255,255,255)", letterSpacing: "-.01em" }}>방명록</h1>
        <p style={{ margin: "6px 0 0", font: `400 14px/20px ${UI_FONT}`, color: "rgb(196,196,196)" }}>
          방문해주셔서 감사합니다! 자유롭게 메시지를 남겨주세요.
        </p>
      </div>

      {!loading &&
        (user ? (
          <form onSubmit={handleSubmit} style={cardStyle}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              rows={3}
              disabled={isPending}
              style={{
                width: "100%",
                resize: "none",
                background: "rgb(30,31,34)",
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,.08)",
                padding: "8px 10px",
                font: `400 13px/20px ${UI_FONT}`,
                color: "rgb(255,255,255)",
                outline: "none",
              }}
            />
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ font: `400 12px/1 ${UI_FONT}`, color: "rgba(255,255,255,.6)" }}>
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                type="submit"
                disabled={!message.trim() || isPending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 4,
                  background: "rgb(96,205,255)",
                  color: "rgb(20,20,20)",
                  font: `600 12px/1 ${UI_FONT}`,
                  opacity: !message.trim() || isPending ? 0.5 : 1,
                  cursor: !message.trim() || isPending ? "default" : "pointer",
                }}
              >
                <Icon name="send" className="w-3 h-3" />
                작성하기
              </button>
            </div>
          </form>
        ) : (
          <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ font: `600 13px/20px ${UI_FONT}`, color: "rgb(255,255,255)" }}>방명록을 작성하려면 로그인이 필요합니다</div>
              <div style={{ marginTop: 2, font: `400 12px/18px ${UI_FONT}`, color: "rgba(255,255,255,.6)" }}>GitHub 계정으로 간편하게 로그인하세요.</div>
            </div>
            <button
              type="button"
              onClick={handleLogin}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 4, background: "rgba(255,255,255,.08)", color: "rgb(255,255,255)", font: `600 12px/1 ${UI_FONT}` }}
            >
              <Icon name="github" className="w-4 h-4" />
              Sign In
            </button>
          </div>
        ))}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ font: `600 11px/1 ${MONO_FONT}`, letterSpacing: ".06em", color: "rgba(255,255,255,.5)" }}>
          {`// ${entries.length} MESSAGES`}
        </div>
        {entries.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", color: "rgba(255,255,255,.5)", font: `400 13px/20px ${UI_FONT}` }}>
            아직 작성된 방명록이 없습니다.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="user" className="w-4 h-4" style={{ color: "rgb(96,205,255)" }} />
                  <span style={{ font: `600 13px/20px ${UI_FONT}`, color: "rgb(255,255,255)" }}>{entry.userName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ font: `400 11px/1 ${MONO_FONT}`, color: "rgba(255,255,255,.4)" }}>{formatDate(entry.createdAt)}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={isPending}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        color: "rgb(255,120,120)",
                        background: "rgba(255,80,80,.1)",
                      }}
                    >
                      <Icon name="trash" className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <p style={{ margin: "8px 0 0", font: `400 13px/20px ${UI_FONT}`, color: "rgb(220,220,220)", whiteSpace: "pre-wrap" }}>{entry.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
