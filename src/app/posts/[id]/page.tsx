import { notFound } from "next/navigation";
import { getPostByIdWithViewIncrement } from "@/shared/lib/services/post.service";
import { DocPreviewSplit } from "@/widgets/doc-preview/doc-preview-split";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const post = await getPostByIdWithViewIncrement(postId);
  if (!post || !post.published) notFound();

  return <DocPreviewSplit doc={{ title: post.title, path: `posts/${post.title}.md`, content: post.content }} />;
}
