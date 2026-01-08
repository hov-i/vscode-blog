import { prisma } from '@/shared/lib/prisma';
import { Post, Tag } from '@prisma/client';
import { unstable_cache } from 'next/cache';

export type PostWithTags = Post & {
  tags: Tag[];
};

export const getPosts = unstable_cache(
  async (query?: string) => {
    return prisma.post.findMany({
      where: query ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          // content 검색 제거: Text 타입이라 너무 느림
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
  },
  ['posts-list'],
  { tags: ['posts'], revalidate: 60 }
);

export const getRecentPosts = unstable_cache(
  async (limit: number = 5) => {
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
  },
  ['recent-posts'],
  { tags: ['posts'], revalidate: 60 }
);

export const getPostCount = unstable_cache(
  async () => {
    return prisma.post.count();
  },
  ['post-count'],
  { tags: ['posts'] }
);

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

export const getTotalViews = unstable_cache(
  async () => {
    const result = await prisma.post.aggregate({
      _sum: {
        views: true,
      },
    });
    return result._sum.views || 0;
  },
  ['total-views'],
  { tags: ['posts', 'views'] }
);
