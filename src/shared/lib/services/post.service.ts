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
      select: {
        id: true,
        title: true,
        description: true,
        // content 제외 - 목록에서는 불필요
        published: true,
        createdAt: true,
        updatedAt: true,
        views: true,
        commentsCount: true,
        tags: {
          select: {
            id: true,
            name: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
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
      select: {
        id: true,
        title: true,
        description: true,
        // content 제외
        published: true,
        createdAt: true,
        updatedAt: true,
        views: true,
        commentsCount: true,
        tags: {
          select: {
            id: true,
            name: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
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

export const getPostById = unstable_cache(
  async (id: number) => {
    return prisma.post.findUnique({
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
  },
  ['post-detail'],
  { tags: ['posts'], revalidate: 60 }
);

// 조회수 증가는 별도로 처리 (캐시 무효화 방지)
export const getPostByIdWithViewIncrement = async (id: number) => {
  const post = await getPostById(id);
  
  if (post) {
    // 조회수 증가는 비동기로 처리 (응답 속도에 영향 없음)
    incrementPostView(id).catch(console.error);
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

export const getPostTitleMap = unstable_cache(
  async () => {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { id: true, title: true },
    });
    const map: Record<string, number> = {};
    for (const p of posts) {
      map[p.title] = p.id;
    }
    return map;
  },
  ['post-title-map'],
  { tags: ['posts'], revalidate: 60 }
);

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
