
import { Icon } from "@/shared/ui/icon";
import { FormattedDate } from "@/shared/ui/formatted-date";
import Link from "next/link";

import { getPosts } from "@/shared/lib/services/post.service";
import { createClient } from "@/shared/lib/supabase/server";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
    const { q, page } = await searchParams;
    const currentPage = Math.max(1, Number(page) || 1);

    const [postsResult, supabase] = await Promise.all([
        getPosts(q, currentPage),
        createClient(),
    ]);
    const { items: posts, totalPages, hasPrev, hasNext, total } = postsResult;

    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.email === 'dbsghdql55555@gmail.com';

    const buildHref = (targetPage: number) => {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (targetPage > 1) params.set('page', String(targetPage));
        const qs = params.toString();
        return qs ? `/posts?${qs}` : '/posts';
    };

    return (
        <div className="max-w-4xl">
             <div className="mb-6 sm:mb-8 animate-slide-up stagger-1">
                <div className="flex items-center mb-3 sm:mb-4">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        JSON
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">posts.json</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] min-w-0 break-keep">
                        {q ? `Search Results for "${q}"` : "All Posts"}
                    </h1>
                    {isAdmin && (
                        <Link href="/posts/new" className="shrink-0">
                            <button className="text-xs px-3 py-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-primary)] transition-colors flex items-center border border-[var(--border-color)]">
                                <Icon name="fileCode" className="w-3 h-3 mr-2" />
                                New Post
                            </button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-3 animate-slide-up stagger-2">
                {posts.map((post: any) => (
                    <PostItem
                        key={post.id}
                        id={post.id}
                        title={post.title}
                        tag={post.tags?.[0]?.name || 'Uncategorized'}
                        description={post.description}
                        time={<FormattedDate date={post.createdAt} />}
                        views={post.views}
                        comments={post.commentsCount || 0}
                        bgClass="bg-[var(--bg-secondary)]"
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2 animate-slide-up stagger-3">
                    {hasPrev ? (
                        <Link
                            href={buildHref(currentPage - 1)}
                            className="text-xs px-3 py-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                        >
                            Prev
                        </Link>
                    ) : (
                        <span className="text-xs px-3 py-1.5 rounded border border-[var(--border-color)] text-[var(--text-secondary)] opacity-40 cursor-not-allowed">
                            Prev
                        </span>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce<number[]>((acc, p) => {
                            if (acc.length && p - acc[acc.length - 1] > 1) acc.push(-1);
                            acc.push(p);
                            return acc;
                        }, [])
                        .map((p, i) =>
                            p === -1 ? (
                                <span key={`gap-${i}`} className="text-xs px-1 text-[var(--text-secondary)]">…</span>
                            ) : p === currentPage ? (
                                <span
                                    key={p}
                                    aria-current="page"
                                    className="text-xs px-3 py-1.5 rounded bg-[var(--accent)] text-white font-medium"
                                >
                                    {p}
                                </span>
                            ) : (
                                <Link
                                    key={p}
                                    href={buildHref(p)}
                                    className="text-xs px-3 py-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                                >
                                    {p}
                                </Link>
                            )
                        )}

                    {hasNext ? (
                        <Link
                            href={buildHref(currentPage + 1)}
                            className="text-xs px-3 py-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                        >
                            Next
                        </Link>
                    ) : (
                        <span className="text-xs px-3 py-1.5 rounded border border-[var(--border-color)] text-[var(--text-secondary)] opacity-40 cursor-not-allowed">
                            Next
                        </span>
                    )}
                </nav>
            )}

            <p className="mt-4 text-center text-xs text-[var(--text-secondary)]">
                {total} posts · page {currentPage} of {totalPages}
            </p>
        </div>
    );
}

const PostItem = ({ id, title, tag, description, time, views, comments, bgClass }: any) => (
    <Link href={`/posts/${id}`}>
        <div className={`p-3 sm:p-4 rounded cursor-pointer transition-all duration-300 hover:bg-[var(--bg-tertiary)] hover:-translate-y-1 hover:shadow-xl ${bgClass}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent)] min-w-0 break-keep">{title}</h3>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] shrink-0 whitespace-nowrap">
                    {tag}
                </span>
            </div>
            <p className="text-xs mb-2 text-[var(--text-secondary)] line-clamp-2">{description}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
                <span className="flex items-center"><Icon name="calendar" className="w-3 h-3 mr-1" />{time}</span>
                <span className="flex items-center"><Icon name="eye" className="w-3 h-3 mr-1" />{views} views</span>
                <span className="flex items-center"><Icon name="messageSquare" className="w-3 h-3 mr-1" />{comments || 0} comments</span>
            </div>
        </div>
    </Link>
);
