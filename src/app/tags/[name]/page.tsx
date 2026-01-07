import { getTagByName } from "@/shared/lib/services/tag.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/shared/ui/icon";

export default async function TagDetailsPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const tag = await getTagByName(decodeURIComponent(name));

    if (!tag) {
        notFound();
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        TAG
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">tags/{tag.name}</span>
                </div>
                <h1 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">
                    #{tag.name}
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                    Found {tag.posts.length} posts and {tag.projects.length} projects with this tag.
                </p>
            </div>

            {tag.posts.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-[var(--text-primary)]">
                        <Icon name="posts" className="w-5 h-5 mr-2 text-[var(--accent)]" />
                        Posts
                    </h2>
                    <div className="space-y-3">
                        {tag.posts.map((post: any) => (
                             <Link key={post.id} href={`/posts/${post.id}`}>
                                <div className="p-4 rounded bg-[var(--bg-secondary)] hover:opacity-90 border border-[var(--border-color)]">
                                    <h3 className="text-sm font-semibold mb-1 text-[var(--text-primary)]">{post.title}</h3>
                                    <p className="text-xs text-[var(--text-secondary)]">{post.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {tag.projects.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center text-[var(--text-primary)]">
                        <Icon name="folder" className="w-5 h-5 mr-2 text-[var(--accent)]" />
                        Projects
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tag.projects.map((project: any) => (
                            <Link key={project.id} href={`/projects/${project.id}`}>
                                <div className="p-4 rounded bg-[var(--bg-secondary)] hover:opacity-90 border border-[var(--border-color)] h-full">
                                    <h3 className="text-sm font-semibold mb-1 text-[var(--text-primary)]">{project.title}</h3>
                                    <p className="text-xs text-[var(--text-secondary)]">{project.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            
            <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
                <Link href="/tags" className="flex items-center text-sm text-[var(--accent)] hover:underline">
                    <Icon name="arrowLeft" className="w-4 h-4 mr-2" />
                    Back to All Tags
                </Link>
            </div>
        </div>
    );
}
