import { prisma } from '@/shared/lib/prisma';
import { Project, Tag } from '@prisma/client';
import { unstable_cache } from 'next/cache';

export type ProjectWithTags = Project & {
  tags: Tag[];
};

export const getProjects = unstable_cache(
  async () => {
    return prisma.project.findMany({
      include: {
        tags: true,
        _count: {
          select: { stars: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
  ['projects-list'],
  { tags: ['projects'], revalidate: 60 }
);

export const getRecentProjects = unstable_cache(
  async (limit: number = 2) => {
    return prisma.project.findMany({
      take: limit,
      include: {
        tags: true,
        _count: {
          select: { stars: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
  ['recent-projects'],
  { tags: ['projects'], revalidate: 60 }
);

export const getProjectCount = unstable_cache(
  async () => {
    return prisma.project.count();
  },
  ['project-count'],
  { tags: ['projects'] }
);

export const getProjectById = async (id: number) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      tags: true,
      stars: {
        include: {
            user: true
        }
      }
    },
  });
};
