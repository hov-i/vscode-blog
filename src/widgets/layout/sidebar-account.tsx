"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getClient } from "@/shared/lib/supabase/client";
import { Icon } from "@/shared/ui/icon";

const UI_FONT = "'Segoe UI Variable','Segoe UI',system-ui,sans-serif";

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: "block" }}>
      <path d="M 2.4 4.4 L 6 8 L 9.6 4.4" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// GitHub sign-in via Supabase Auth, rendered in the sidebar's existing
// account-row slot (same 44px layout the static placeholder used).
export const SidebarAccount = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const supabase = await getClient();
    await supabase.auth.signOut();
  }

  const avatarUrl = user?.user_metadata.avatar_url as string | undefined;
  const displayName = loading ? "" : user ? user.user_metadata.full_name || user.email?.split("@")[0] || "User" : "Sign In";
  const subtitle = loading ? "" : user ? "Connected via GitHub" : "with GitHub";

  return (
    <div
      className="group"
      role="button"
      tabIndex={0}
      onClick={!loading && !user ? handleLogin : undefined}
      onKeyDown={(e) => {
        if (!loading && !user && (e.key === "Enter" || e.key === " ")) handleLogin();
      }}
      style={{ position: "relative", height: 44, borderRadius: 4, cursor: !loading && !user ? "pointer" : "default" }}
    >
      <div className="absolute inset-x-[5px] top-[3px] bottom-[3px] rounded-[3px] group-hover:bg-[rgba(255,255,255,.0605)]" />

      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          width: 28,
          height: 28,
          borderRadius: 9999,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-tertiary)",
          color: "rgb(96,205,255)",
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <Icon name={user ? "user" : "github"} className="w-4 h-4" />
        )}
      </div>

      <span
        style={{
          pointerEvents: "none",
          position: "absolute",
          left: 52,
          right: 34,
          top: "50%",
          transform: "translateY(calc(-50% - 9px))",
          height: 18,
          fontFamily: UI_FONT,
          fontSize: 14,
          color: "#FFFFFF",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {displayName}
      </span>
      <span
        style={{
          pointerEvents: "none",
          position: "absolute",
          left: 52,
          right: 34,
          top: "50%",
          transform: "translateY(1px)",
          height: 16,
          fontFamily: UI_FONT,
          fontSize: 12,
          color: "rgba(255,255,255,.786)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {subtitle}
      </span>

      {user ? (
        <button
          type="button"
          onClick={handleLogout}
          title="Sign Out"
          className="opacity-0 group-hover:opacity-100"
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,.786)",
            borderRadius: 4,
          }}
        >
          <Icon name="logOut" className="w-4 h-4" />
        </button>
      ) : (
        <div style={{ pointerEvents: "none", position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(255,255,255,.786)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Chevron />
        </div>
      )}
    </div>
  );
};
