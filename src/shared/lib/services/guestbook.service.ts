import { prisma } from '@/shared/lib/prisma';
import { Guestbook, User } from '@prisma/client';
import { unstable_cache } from 'next/cache';

export type GuestbookWithUser = Guestbook & {
  user: User;
};

export const getGuestbooks = unstable_cache(
  async () => {
    return prisma.guestbook.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
  ['guestbooks-list'],
  { tags: ['guestbooks'], revalidate: 30 }
);

export const getGuestbookCount = unstable_cache(
  async () => {
    return prisma.guestbook.count();
  },
  ['guestbook-count'],
  { tags: ['guestbooks'] }
);
