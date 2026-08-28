import { getPostCount, getRecentPosts, getTotalViews } from "@/shared/lib/services/post.service";
import { getProjectCount, getRecentProjects } from "@/shared/lib/services/project.service";
import { getTags } from "@/shared/lib/services/tag.service";
import { WelcomeDashboard } from "@/widgets/welcome/welcome-dashboard";

// Reads the DB directly on every render — force dynamic so Next never
// attempts to prerender this at build time (Vercel's build machine can't
// reach the DB; only the deployed runtime can).
export const dynamic = "force-dynamic";

export default async function Home() {
  const [postCount, projectCount, tags, totalViews, recentPosts, featuredProjects] = await Promise.all([
    getPostCount(),
    getProjectCount(),
    getTags(),
    getTotalViews(),
    getRecentPosts(5),
    getRecentProjects(2),
  ]);

  return (
    <WelcomeDashboard
      stats={{ postCount, projectCount, tagCount: tags.length, totalViews }}
      recentPosts={recentPosts.filter((p) => p.published)}
      featuredProjects={featuredProjects}
    />
  );
}
