import { notFound } from "next/navigation";
import { getTagByName } from "@/shared/lib/services/tag.service";
import { TagDetailDashboard } from "@/widgets/tags/tag-detail-dashboard";

export default async function TagDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const tag = await getTagByName(decodeURIComponent(name));

  if (!tag) notFound();

  return <TagDetailDashboard name={tag.name} posts={tag.posts} projects={tag.projects} />;
}
