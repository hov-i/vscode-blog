"use client";

import { Icon } from "@/shared/ui/icon";
import { deleteGuestbook } from "@/shared/lib/actions";
import { useTransition } from "react";

interface GuestbookItemProps {
    id: number;
    message: string;
    userName: string;
    createdAt: React.ReactNode;
    isAdmin: boolean;
}

export const GuestbookItem = ({ id, message, userName, createdAt, isAdmin }: GuestbookItemProps) => {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        startTransition(async () => {
            try {
                await deleteGuestbook(id);
            } catch (error) {
                console.error("Failed to delete guestbook:", error);
                alert("방명록 삭제에 실패했습니다.");
            }
        });
    };

    return (
        <div className="p-4 rounded bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors border border-transparent hover:border-[var(--border-color)]">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon name="user" className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{userName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-secondary)] flex items-center">
                        <Icon name="calendar" className="w-3 h-3 mr-1" />
                        {createdAt}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="text-xs px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors disabled:opacity-50"
                        >
                            {isPending ? (
                                <Icon name="loader" className="w-3 h-3 animate-spin" />
                            ) : (
                                <Icon name="trash" className="w-3 h-3" />
                            )}
                        </button>
                    )}
                </div>
            </div>
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{message}</p>
        </div>
    );
};
