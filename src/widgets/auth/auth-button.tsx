"use client";

import { createClient } from "@/shared/lib/supabase/client";
import { Icon } from "@/shared/ui/icon";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export const AuthButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    return (
        <button 
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            title="Sign Out"
        >
            <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                {user.user_metadata.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                    user.email?.[0].toUpperCase()
                )}
            </div>
        </button>
    );
  }

  return (
    <button 
        onClick={handleLogin}
        className="w-12 h-12 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        title="Sign in with Github"
    >
        <Icon name="user" className="w-6 h-6 text-[var(--vscode-fg)]" />
    </button>
  );
};
