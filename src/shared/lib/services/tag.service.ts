import { prisma } from '@/shared/lib/prisma';

export const getTags = async () => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true, projects: true },
      },
    },
    orderBy: {
        name: 'asc'
    }
  });

  return tags
    .map(tag => ({
      ...tag,
      count: tag._count.posts + tag._count.projects
    }))
    .filter(tag => tag.count > 0);
};

export const getTagByName = async (name: string) => {
  return prisma.tag.findUnique({
    where: { name },
    include: {
        posts: {
            include: {
                tags: true,
                author: true
            },
            orderBy: { createdAt: 'desc' }
        },
        projects: {
            include: {
                tags: true
            },
            orderBy: { createdAt: 'desc' }
        }
    }
  });
};
