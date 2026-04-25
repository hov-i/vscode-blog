"use client";

import { Icon } from "@/shared/ui/icon";
import { FormattedDate } from "@/shared/ui/formatted-date";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

// type definition not needed inline if we destructure, but good for clarity
export const HomePage = ({ stats, recentPosts, featuredProjects, githubInfo }: any) => {
    const updatedLabel = githubInfo?.updatedAt
        ? new Date(githubInfo.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
          })
        : "—";
    const versionLabel = githubInfo?.version ?? "v0.0.0";

    return (
        <div className="max-w-4xl">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                <div className="flex items-center mb-3 sm:mb-4">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        MARKDOWN
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">welcome.md</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-[var(--text-primary)] break-keep">
                    윤홍비|발전을 추구하는 개발자
                </h1>
                <p className="text-sm mb-2 text-[var(--text-secondary)]">
                    Frontend Developer
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                    <a
                        href="https://github.com/hov-i/vscode-blog/commits"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-[var(--accent)] transition-colors"
                    >
                        <Icon name="calendar" className="w-4 h-4 mr-1" />
                        Updated: {updatedLabel}
                    </a>
                    <a
                        href="https://github.com/hov-i/vscode-blog/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-[var(--accent)] transition-colors"
                    >
                        <Icon name="gitBranch" className="w-4 h-4 mr-1" />
                        {versionLabel}
                    </a>
                </div>
            </div>

            <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded bg-[var(--bg-secondary)] border-l-[3px] border-[var(--accent)] animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-xs mb-3 text-[var(--text-secondary)] tracking-wider">
                    // QUICK STATS
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                        <div className="text-xl sm:text-2xl font-bold mb-1 text-[var(--accent)]">{stats?.postCount || 0}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Total Posts</div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-bold mb-1 text-[var(--accent)]">{stats?.projectCount || 0}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Projects</div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-bold mb-1 text-[var(--accent)]">{stats?.tagCount || 0}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Tags</div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-bold mb-1 text-[var(--accent)]">
                            {stats?.totalViews >= 1000
                                ? `${(stats.totalViews / 1000).toFixed(1)}k`
                                : stats?.totalViews || 0}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">Page Views</div>
                    </div>
                </div>
            </div>

            <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center justify-between mb-4 gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] flex items-center min-w-0">
                        <Icon name="posts" className="w-5 h-5 mr-2 text-[var(--accent)] shrink-0" />
                        Recent Posts
                    </h2>
                    <Link href="/posts" className="shrink-0">
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
                <div className="flex items-center justify-between mb-4 gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] flex items-center min-w-0">
                        <Icon name="star" className="w-5 h-5 mr-2 text-[var(--accent)] shrink-0" />
                        Featured Projects
                    </h2>
                    <Link href="/projects" className="shrink-0">
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
            "p-3 sm:p-4 rounded cursor-pointer transition-all duration-300",
            "hover:bg-[var(--bg-tertiary)] hover:-translate-y-1 hover:shadow-xl",
            bgClass
        )}>
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

const ProjectItem = ({ id, title, description, tags, stars }: any) => (
    <Link href={id ? `/projects/${id}` : "#"}>
        <div className="p-3 sm:p-4 rounded cursor-pointer transition-all duration-300 hover:bg-[var(--bg-tertiary)] hover:-translate-y-1 hover:shadow-xl bg-[var(--bg-secondary)] h-full border border-transparent hover:border-[var(--accent)]">
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
