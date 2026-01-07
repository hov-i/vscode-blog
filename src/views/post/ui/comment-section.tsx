"use client";

import { Icon } from "@/shared/ui/icon";
import { useState, useTransition } from "react";
import { addComment } from "@/shared/lib/actions";
import { FormattedDate } from "@/shared/ui/formatted-date";

interface CommentSectionProps {
    postId: number;
    comments: any[];
    user: any;
}

export default function CommentSection({ postId, comments, user }: CommentSectionProps) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isPending) return;

        startTransition(async () => {
            await addComment(postId, content);
            setContent("");
        });
    };

    return (
        <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)] flex items-center">
                <Icon name="messageSquare" className="w-5 h-5 mr-2" />
                Comments ({comments.length})
            </h2>

            {user ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md overflow-hidden focus-within:border-[var(--accent)] transition-colors">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-transparent p-4 text-sm text-[var(--text-primary)] focus:outline-none min-h-[100px] block"
                            disabled={isPending}
                        />
                        <div className="px-4 py-2 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] flex justify-end">
                            <button
                                type="submit"
                                disabled={isPending || !content.trim()}
                                className="px-4 py-1.5 text-xs rounded bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center"
                            >
                                {isPending && <Icon name="loading" className="w-3 h-3 mr-2 animate-spin" />}
                                Post Comment
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="p-4 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] mb-8 text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                        Please sign in to leave a comment.
                    </p>
                </div>
            )}

            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-sm text-[var(--text-secondary)] italic">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="w-8 h-8 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                                <Icon name="user" className="w-4 h-4 text-[var(--text-secondary)]" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-[var(--text-primary)]">
                                        {comment.user.name || comment.user.email.split('@')[0]}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-secondary)]">
                                        <FormattedDate date={comment.createdAt} />
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
