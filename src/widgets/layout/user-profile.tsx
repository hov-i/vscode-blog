"use client";

import { createClient } from "@/shared/lib/supabase/client";
import { Icon } from "@/shared/ui/icon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export const UserProfile = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
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

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await supabase.auth.signOut();
    };

    if (loading) {
        return (
            <div className="flex items-center p-1 rounded transition-colors opacity-50">
                 <div className="w-8 h-8 rounded-full mr-2 bg-[var(--bg-tertiary)] animate-pulse" />
                 <div className="flex-1">
                    <div className="h-3 w-20 bg-[var(--bg-tertiary)] rounded animate-pulse mb-1" />
                    <div className="h-3 w-12 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                 </div>
            </div>
        );
    }

    if (!user) {
        return (
            <button 
                onClick={handleLogin}
                className="w-full flex items-center cursor-pointer hover:bg-white/5 rounded p-1 transition-colors text-left"
            >
                <div className="w-8 h-8 rounded-full mr-2 bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--accent)]">
                   <Icon name="github" className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <div className="text-xs font-medium text-[var(--text-primary)]">
                        Sign In
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">with GitHub</div>
                </div>
            </button>
        );
    }

    // Get user details
    const avatarUrl = user.user_metadata.avatar_url;
    const fullName = user.user_metadata.full_name || user.email?.split('@')[0] || 'User';
    const email = user.email;

    return (
        <div className="group relative">
             <Link href="/about">
                <div className="flex items-center cursor-pointer hover:bg-white/5 rounded p-1 transition-colors">
                    <div className="w-8 h-8 rounded-full mr-2 bg-[var(--bg-tertiary)] overflow-hidden flex items-center justify-center text-xs text-[var(--text-secondary)]">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                            <Icon name="user" className="w-4 h-4" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                            {fullName}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] truncate">
                            {email}
                        </div>
                    </div>
                </div>
            </Link>
            <button 
                onClick={handleLogout}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity"
                title="Sign Out"
            >
                <Icon name="logOut" className="w-4 h-4" />
            </button>
        </div>
    );
}
