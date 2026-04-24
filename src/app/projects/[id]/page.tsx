import { Icon } from "@/shared/ui/icon";
import { MarkdownRenderer } from "@/shared/ui/markdown-renderer";
import Link from "next/link";
import { getProjectById } from "@/shared/lib/services/project.service";
import { FormattedDate } from "@/shared/ui/formatted-date";
import { notFound } from "next/navigation";
import { deleteProject, toggleProjectStar } from "@/shared/lib/actions";
import { createClient } from "@/shared/lib/supabase/server";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (isNaN(id)) {
        notFound();
    }
    
    const project = await getProjectById(id) as any;

    if (!project) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const isStarred = user ? project.stars.some((s: any) => s.user.email === user.email) : false;
    const starCount = project.stars.length;

    const deleteAction = deleteProject.bind(null, String(project.id));
    const starAction = toggleProjectStar.bind(null, project.id);

    const getForkUrl = (repoUrl: string) => {
        if (!repoUrl || !repoUrl.includes('github.com')) return null;
        return `${repoUrl.replace(/\/$/, '')}/fork`;
    };

    const forkUrl = project.repository ? getForkUrl(project.repository) : null;

    return (
        <div className="max-w-4xl">
             <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-xs text-[var(--text-secondary)]">
                        <Link href="/projects" className="hover:text-[var(--text-primary)]">projects</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[var(--text-primary)]">{project.title}</span>
                    </div>
                    {user?.email === 'dbsghdql55555@gmail.com' && (
                        <div className="flex gap-2">
                            <Link href={`/projects/${project.id}/edit`}>
                                <button
                                    type="button"
                                    className="text-xs px-3 py-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--accent)] hover:text-white text-[var(--accent)] transition-colors flex items-center border border-[var(--border-color)] cursor-pointer"
                                >
                                    <Icon name="edit" className="w-3 h-3 mr-2" />
                                    Edit Project
                                </button>
                            </Link>
                            <form action={deleteAction}>
                                <button
                                    type="submit"
                                    className="text-xs px-3 py-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-red-500 hover:text-white text-red-500 transition-colors flex items-center border border-[var(--border-color)] cursor-pointer"
                                >
                                    <Icon name="trash" className="w-3 h-3 mr-2" />
                                    Delete Project
                                </button>
                            </form>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center justify-between mb-6">
                     <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        {project.title}
                    </h1>
                    <div className="flex gap-3">
                         <form action={starAction}>
                            <button 
                                type="submit" 
                                disabled={!user}
                                className={`flex items-center px-3 py-1 text-xs border border-[var(--border-color)] rounded transition-colors ${isStarred ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
                            >
                                <Icon name="star" className={`w-3 h-3 mr-2 ${isStarred ? 'fill-current' : ''}`} />
                                <span className="font-medium mr-2">{isStarred ? 'Starred' : 'Star'}</span>
                                <span className={`px-1.5 rounded-full ${isStarred ? 'bg-white/20' : 'bg-[var(--bg-tertiary)]'}`}>{starCount}</span>
                            </button>
                         </form>

                         {forkUrl && (
                            <a href={forkUrl} target="_blank" rel="noopener noreferrer">
                                <button className="flex items-center px-3 py-1 text-xs border border-[var(--border-color)] rounded bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors">
                                    <Icon name="gitBranch" className="w-3 h-3 mr-2" />
                                    <span className="font-medium">Fork</span>
                                </button>
                            </a>
                         )}
                    </div>
                </div>

                <div className="border border-[var(--border-color)] rounded bg-[var(--bg-secondary)] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-between">
                         <div className="flex items-center text-xs">
                             <Icon name="user" className="w-3 h-3 mr-2 text-[var(--text-secondary)]" />
                             <span className="font-medium text-[var(--text-primary)]">Author</span>
                             <span className="text-[var(--text-secondary)] ml-2">Initial commit</span>
                         </div>
                         <div className="text-xs text-[var(--text-secondary)]">
                             <FormattedDate date={project.createdAt} />
                         </div>
                    </div>
                    
                    <div className="p-6">
                        <h2 className="flex items-center text-lg font-bold mb-4 border-b border-[var(--border-color)] pb-2 text-[var(--text-primary)]">
                            <Icon name="fileCode" className="w-5 h-5 mr-2" />
                            README.md
                        </h2>
                        
                        {project.description && (
                            <p className="text-sm text-[var(--text-primary)] mb-6 pb-6 border-b border-[var(--border-color)]">
                                {project.description}
                            </p>
                        )}

                        {project.content && (
                            <div className="mb-6">
                                <MarkdownRenderer content={project.content} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {project.repository && (
                                <div>
                                    <h3 className="text-md font-bold mb-2 text-[var(--text-primary)] flex items-center">
                                        <Icon name="github" className="w-4 h-4 mr-2" /> Repository
                                    </h3>
                                    <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded font-mono text-xs text-[var(--accent)]">
                                        <a href={project.repository} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">{project.repository}</a>
                                    </div>
                                </div>
                            )}

                             {project.demoUrl && (
                                <div>
                                    <h3 className="text-md font-bold mb-2 text-[var(--text-primary)] flex items-center">
                                        <Icon name="wifi" className="w-4 h-4 mr-2" /> Live Demo
                                    </h3>
                                    <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded font-mono text-xs text-[var(--accent)]">
                                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">{project.demoUrl}</a>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {project.tags.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-md font-bold mb-2 text-[var(--text-primary)]">Tags</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {project.tags.map((tag: any) => (
                                        <Link key={tag.id} href={`/tags/${tag.name}`}>
                                            <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors">
                                                {tag.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
