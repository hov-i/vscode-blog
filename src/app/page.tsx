import { HomePage } from "@/views/home/ui/home-page";
import { getPostCount, getRecentPosts, getTotalViews } from "@/shared/lib/services/post.service";
import { getProjectCount, getRecentProjects } from "@/shared/lib/services/project.service";
import { getTags } from "@/shared/lib/services/tag.service";

export default async function Home() {
  const postCount = await getPostCount();
  const projectCount = await getProjectCount();
  const tags = await getTags();
  const recentPosts = await getRecentPosts();
  const featuredProjects = await getRecentProjects(2);
  const totalViews = await getTotalViews();

  const stats = {
    postCount,
    projectCount,
    tagCount: tags.length,
    totalViews,
  };

  return <HomePage stats={stats} recentPosts={recentPosts} featuredProjects={featuredProjects} />;
}
