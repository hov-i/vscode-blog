

import { Icon } from "@/shared/ui/icon";
import Link from "next/link";

import { getProjects } from "@/shared/lib/services/project.service";
import { createClient } from "@/shared/lib/supabase/server";

export default async function ProjectsPage() {
    const projects = await getProjects();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.email === 'dbsghdql55555@gmail.com';

    return (
        <div className="max-w-4xl">
            <div className="mb-8 animate-slide-up stagger-1">
                <div className="flex items-center mb-4">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        JSON
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">projects.json</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        Projects
                    </h1>
                    {isAdmin && (
                        <Link href="/projects/new">
                            <button className="text-xs px-3 py-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-primary)] transition-colors flex items-center border border-[var(--border-color)]">
                                <Icon name="folder" className="w-3 h-3 mr-2" />
                                New Project
                            </button>
                        </Link>
                    )}
                </div>
                <p className="text-sm mb-6 text-[var(--text-secondary)]">
                    진행했던 프로젝트들을 모아서 볼 수 있는 페이지 입니다.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up stagger-2">
                {projects.map((project: any) => (
                    <ProjectItem
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        description={project.description}
                        tags={project.tags?.map((t: any) => t.name) || []}
                        stars={project._count?.stars || 0}
                    />
                ))}
            </div>
        </div>
    );
}

const ProjectItem = ({ id, title, description, tags, stars }: any) => (
    <Link href={`/projects/${id}`}>
        <div className="group p-4 rounded cursor-pointer transition-all duration-300 hover:bg-[var(--bg-tertiary)] hover:-translate-y-1 hover:shadow-xl bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--accent)] h-full">
            <div className="flex items-center justify-between mb-2">
                <Icon name="folder" className="w-5 h-5 text-[var(--accent)] transition-transform group-hover:scale-110" />
                <div className="flex items-center gap-2">
                     <span className="text-[10px] text-[var(--text-secondary)] flex items-center">
                        <Icon name="star" className="w-3 h-3 mr-1" /> {stars}
                    </span>
                    <Icon name="github" className="w-4 h-4 text-[var(--text-secondary)] transition-colors group-hover:text-[var(--accent)]" />
                </div>
            </div>
            <h3 className="text-sm font-semibold mb-1 text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">{title}</h3>
            <p className="text-xs mb-3 text-[var(--text-secondary)] line-clamp-2">{description}</p>
            <div className="flex gap-2 flex-wrap">
                {tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent)] hover:text-white">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </Link>
);
