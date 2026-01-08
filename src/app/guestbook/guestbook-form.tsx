"use client";

import { Icon } from "@/shared/ui/icon";
import { createGuestbook } from "@/shared/lib/actions";
import { useState, useTransition } from "react";
import { AuthButton } from "@/widgets/auth/auth-button";

interface GuestbookFormProps {
    user: any;
}

export const GuestbookForm = ({ user }: GuestbookFormProps) => {
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!message.trim()) return;

        startTransition(async () => {
            try {
                await createGuestbook(message);
                setMessage("");
            } catch (error) {
                console.error("Failed to create guestbook:", error);
                alert("방명록 작성에 실패했습니다.");
            }
        });
    };

    if (!user) {
        return (
            <div className="p-6 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold mb-1 text-[var(--text-primary)]">
                            방명록을 작성하려면 로그인이 필요합니다
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Google 계정으로 간편하게 로그인하세요.
                        </p>
                    </div>
                    <AuthButton />
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-start gap-3">
                <Icon name="user" className="w-5 h-5 mt-2 text-[var(--accent)]" />
                <div className="flex-1">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="w-full px-3 py-2 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm outline-none border border-transparent focus:border-[var(--accent)] transition-colors resize-none"
                        rows={3}
                        disabled={isPending}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-[var(--text-secondary)]">
                            {user.user_metadata?.full_name || user.email}
                        </span>
                        <button
                            type="submit"
                            disabled={!message.trim() || isPending}
                            className="text-xs px-4 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Icon name="loader" className="w-3 h-3 animate-spin" />
                                    작성 중...
                                </>
                            ) : (
                                <>
                                    <Icon name="send" className="w-3 h-3" />
                                    작성하기
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};
