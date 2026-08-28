import { notFound } from "next/navigation";
import { getProjectById } from "@/shared/lib/services/project.service";
import { DocPreviewSplit } from "@/widgets/doc-preview/doc-preview-split";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) notFound();

  const project = await getProjectById(projectId);
  if (!project) notFound();

  const content = project.content ?? project.description ?? "_아직 작성된 내용이 없습니다._";

  return <DocPreviewSplit doc={{ title: project.title, path: `projects/${project.title}.md`, content }} />;
}
