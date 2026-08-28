import { getTags } from "@/shared/lib/services/tag.service";
import { TagsDashboard } from "@/widgets/tags/tags-dashboard";

// Reads the DB directly on every render — force dynamic so Next never
// attempts to prerender this at build time (Vercel's build machine can't
// reach the DB; only the deployed runtime can).
export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await getTags();
  return <TagsDashboard tags={tags} />;
}
