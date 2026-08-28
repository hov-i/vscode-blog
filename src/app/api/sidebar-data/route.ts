import { NextResponse } from "next/server";
import { getRecentPosts } from "@/shared/lib/services/post.service";
import { getProjects } from "@/shared/lib/services/project.service";
import { getTags } from "@/shared/lib/services/tag.service";

// Feeds the Explorer/Search sidebar (a Client Component) on mount instead of
// through the root layout — a Route Handler is its own segment, so its DB
// reads no longer force every page in the app into dynamic rendering.
export const dynamic = "force-dynamic";

export async function GET() {
  const [recentPosts, allProjects, allTags] = await Promise.all([
    getRecentPosts(50),
    getProjects(),
    getTags(),
  ]);

  const posts = recentPosts.filter((p) => p.published).map((p) => ({ id: p.id, title: p.title }));
  const projects = allProjects.map((p) => ({ id: p.id, title: p.title }));
  const tags = allTags.map((t) => ({ id: t.id, name: t.name }));

  return NextResponse.json({ posts, projects, tags });
}
