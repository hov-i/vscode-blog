import { prisma } from "@/shared/lib/prisma";

export type PostSearchResult = {
  id: number;
  title: string;
  description: string | null;
  url: string;
  snippet: string;
};

export async function searchPosts(query: string): Promise<PostSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const keywords = trimmed.split(/\s+/).filter(Boolean).slice(0, 5);

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: keywords.flatMap((kw) => [
        { title: { contains: kw, mode: "insensitive" as const } },
        { description: { contains: kw, mode: "insensitive" as const } },
      ]),
    },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    url: `/posts/${p.id}`,
    snippet: p.content ? p.content.replace(/\s+/g, " ").slice(0, 200) : "",
  }));
}
