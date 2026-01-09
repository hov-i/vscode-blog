"use client";

import { Icon } from "@/shared/ui/icon";
import { FormattedDate } from "@/shared/ui/formatted-date";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

// type definition not needed inline if we destructure, but good for clarity
export const HomePage = ({ stats, recentPosts, featuredProjects }: any) => {
    return (
        <div className="max-w-4xl">
            {/* Header Section */}
            <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                <div className="flex items-center mb-4">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        MARKDOWN
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">welcome.md</span>
                </div>
                <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">
                    윤홍비|발전을 추구하는 개발자
                </h1>
                <p className="text-sm mb-2 text-[var(--text-secondary)]">
                    Frontend Developer
                </p>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center">
                        <Icon name="calendar" className="w-4 h-4 mr-1" />
                        Updated: Jan 2026
                    </span>
                    <span className="flex items-center">
                        <Icon name="gitBranch" className="w-4 h-4 mr-1" />
                        v1.0.0
                    </span>
                </div>
            </div>

            <div className="mb-8 p-4 rounded bg-[var(--bg-secondary)] border-l-[3px] border-[var(--accent)] animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-xs mb-3 text-[var(--text-secondary)] tracking-wider">
                    // QUICK STATS
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <div className="text-2xl font-bold mb-1 text-[var(--accent)]">{stats?.postCount || 0}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Total Posts</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold mb-1 text-[var(--accent)]">{stats?.projectCount || 0}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Projects</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold mb-1 text-[var(--accent)]">{stats?.tagCount || 0}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Tags</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold mb-1 text-[var(--accent)]">
                            {stats?.totalViews >= 1000 
                                ? `${(stats.totalViews / 1000).toFixed(1)}k` 
                                : stats?.totalViews || 0}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">Page Views</div>
                    </div>
                </div>
            </div>

            <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center">
                        <Icon name="posts" className="w-5 h-5 mr-2 text-[var(--accent)]" />
                        Recent Posts
                    </h2>
                    <Link href="/posts">
                        <button className="text-xs px-3 py-1 rounded hover:opacity-80 bg-[var(--accent)] text-white flex items-center">
                            View All <Icon name="arrowRight" className="w-3 h-3 ml-1" />
                        </button>
                    </Link>
                </div>

                <div className="space-y-3">
                    {recentPosts?.map((post: any) => (
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
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center">
                        <Icon name="star" className="w-5 h-5 mr-2 text-[var(--accent)]" />
                        Featured Projects
                    </h2>
                    <Link href="/projects">
                         <button className="text-xs px-3 py-1 rounded hover:opacity-80 bg-[var(--accent)] text-white flex items-center">
                            View All <Icon name="arrowRight" className="w-3 h-3 ml-1" />
                        </button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {featuredProjects?.map((project: any) => (
                        <ProjectItem
                            key={project.id}
                            id={project.id}
                            title={project.title}
                            description={project.description}
                            tags={project.tags?.map((t: any) => t.name) || []}
                            stars={project.stars?.length || 0}
                        />
                    ))}
                </div>
             </div>
        </div>
    );
};

const PostItem = ({ id, title, tag, description, time, views, comments, bgClass }: any) => (
    <Link href={id ? `/posts/${id}` : "#"}>
        <div className={cn(
            "p-4 rounded cursor-pointer transition-all duration-300",
            "hover:bg-[var(--bg-tertiary)] hover:-translate-y-1 hover:shadow-xl",
            bgClass
        )}>
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]">{title}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                    {tag}
                </span>
            </div>
            <p className="text-xs mb-2 text-[var(--text-secondary)]">{description}</p>
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <span className="flex items-center"><Icon name="calendar" className="w-3 h-3 mr-1" />{time}</span>
                <span className="flex items-center"><Icon name="eye" className="w-3 h-3 mr-1" />{views} views</span>
                <span className="flex items-center"><Icon name="messageSquare" className="w-3 h-3 mr-1" />{comments || 0} comments</span>
            </div>
        </div>
    </Link>
);

const ProjectItem = ({ id, title, description, tags, stars }: any) => (
    <Link href={id ? `/projects/${id}` : "#"}>
        <div className="p-4 rounded cursor-pointer transition-all duration-300 hover:bg-[var(--bg-tertiary)] hover:-translate-y-1 hover:shadow-xl bg-[var(--bg-secondary)] h-full border border-transparent hover:border-[var(--accent)]">
            <div className="flex items-center justify-between mb-2">
                <Icon name="folder" className="w-5 h-5 text-[var(--accent)] transition-transform group-hover:scale-110" />
                <div className="flex items-center gap-2">
                     <span className="text-[10px] text-[var(--text-secondary)] flex items-center">
                        <Icon name="star" className="w-3 h-3 mr-1" /> {stars || 0}
                    </span>
                    <Icon name="github" className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
            </div>
            <h3 className="text-sm font-semibold mb-1 text-[var(--text-primary)] transition-colors">{title}</h3>
            <p className="text-xs mb-3 text-[var(--text-secondary)] line-clamp-2">{description}</p>
            <div className="flex gap-2 flex-wrap">
                {tags?.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--accent)] hover:text-white transition-colors">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </Link>
);
