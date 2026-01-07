import { Icon } from "@/shared/ui/icon";
import Link from "next/link";
import { getPostById } from "@/shared/lib/services/post.service";
import { FormattedDate } from "@/shared/ui/formatted-date";
import { notFound } from "next/navigation";
import { deletePost } from "@/shared/lib/actions";
import { createClient } from "@/shared/lib/supabase/server";
import CommentSection from "@/views/post/ui/comment-section";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (isNaN(id)) {
        notFound();
    }
    
    const post = await getPostById(id) as any;

    if (!post) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const deleteAction = deletePost.bind(null, String(post.id));

    return (
        <div className="max-w-4xl">
             <div className="mb-6 pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                            MD
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">posts/{post.id}.md</span>
                    </div>
                    {user?.email === 'dbsghdql55555@gmail.com' && (
                         <form action={deleteAction}>
                            <button 
                                type="submit"
                                className="text-xs px-3 py-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-red-500 hover:text-white text-red-500 transition-colors flex items-center border border-[var(--border-color)] cursor-pointer"
                            >
                                <Icon name="trash" className="w-3 h-3 mr-2" />
                                Delete Post
                            </button>
                        </form>
                    )}
                </div>
                <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">
                    {post.title}
                </h1>
                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center">
                        <Icon name="user" className="w-3 h-3 mr-1" />
                        {post.author?.name || 'Anonymous'}
                    </span>
                    <span className="flex items-center">
                        <Icon name="calendar" className="w-3 h-3 mr-1" />
                        <FormattedDate date={post.createdAt} />
                    </span>
                     <span className="flex items-center">
                        <Icon name="messageSquare" className="w-3 h-3 mr-1" />
                        {post.comments?.length || 0} comments
                    </span>
                </div>
                {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2 mt-4">
                        {post.tags.map((tag: any) => (
                            <Link key={tag.id} href={`/tags/${tag.name}`}>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent)] transition-colors">
                                    #{tag.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <article className="prose prose-invert max-w-none text-[var(--text-primary)] whitespace-pre-wrap mb-12">
                {post.content}
            </article>

            <CommentSection postId={post.id} comments={post.comments || []} user={user} />

            <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
                <Link href="/posts" className="flex items-center text-sm text-[var(--accent)] hover:underline">
                    <Icon name="arrowLeft" className="w-4 h-4 mr-2" />
                    Back to Posts
                </Link>
            </div>
        </div>
    );
}
