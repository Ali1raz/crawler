import { prisma } from '#/db';
import { authMiddleware } from '#/lib/middleware/auth';
import { ItemStatus } from '#/generated/prisma/enums';
import { createServerFn } from '@tanstack/react-start';
import z from 'zod';

const getItemsFiltersSchema = z.object({
  search: z.string().default(''),
  status: z.union([z.literal('all'), z.enum(ItemStatus)]).default('all'),
});

export const getItems = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(getItemsFiltersSchema)
  .handler(async ({ context, data }) => {
    const search = data.search.trim();

    const items = await prisma.savedItem.findMany({
      where: {
        userId: context.session.user.id,
        ...(data.status !== 'all' ? { status: data.status } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { url: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        url: true,
        title: true,
        ogImage: true,
        author: true,
        publishedAt: true,
        createdAt: true,
        status: true,
        summary: true,
      },
    });

    return items;
  });
