import { prisma } from '@/shared/lib/prisma';
import { Post, Tag } from '@prisma/client';

export type PostWithTags = Post & {
  tags: Tag[];
};

export const getPosts = async (query?: string) => {
  return prisma.post.findMany({
    where: query ? {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    } : {},
    include: {
      tags: true,
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getRecentPosts = async (limit: number = 5) => {
  return prisma.post.findMany({
    take: limit,
    include: {
      tags: true,
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getPostCount = async () => {
  return prisma.post.count();
};

export const getPostById = async (id: number) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: true,
      author: true,
      comments: {
        include: {
            user: true
        },
        orderBy: {
            createdAt: 'desc'
        }
      }
    },
  });

  if (post) {
      await incrementPostView(id);
  }

  return post;
};

export const incrementPostView = async (id: number) => {
    return prisma.post.update({
        where: { id },
        data: {
            views: {
                increment: 1
            }
        }
    });
};
export const getTotalViews = async () => {
  const result = await prisma.post.aggregate({
    _sum: {
      views: true,
    },
  });
  return result._sum.views || 0;
};
