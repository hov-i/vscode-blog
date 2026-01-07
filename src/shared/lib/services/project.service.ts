import { prisma } from '@/shared/lib/prisma';
import { Project, Tag } from '@prisma/client';

export type ProjectWithTags = Project & {
  tags: Tag[];
};

export const getProjects = async () => {
  return prisma.project.findMany({
    include: {
      tags: true,
      stars: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getRecentProjects = async (limit: number = 2) => {
  return prisma.project.findMany({
    take: limit,
    include: {
      tags: true,
      stars: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getProjectCount = async () => {
  return prisma.project.count();
};

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
