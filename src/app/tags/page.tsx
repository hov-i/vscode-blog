import { getTags } from "@/shared/lib/services/tag.service";
import { TagsDashboard } from "@/widgets/tags/tags-dashboard";

export default async function TagsPage() {
  const tags = await getTags();
  return <TagsDashboard tags={tags} />;
}
