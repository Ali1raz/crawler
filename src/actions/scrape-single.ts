import { firecrawl } from '#/lib/firecrawl';
import { createServerFn } from '@tanstack/react-start';
import {
  bulkImportSchema,
  singleUrlImportSchema,
  type ExtractSchemaType,
} from '#/components/forms/schema';
import { prisma } from '#/db';
import { authMiddleware } from '#/lib/middleware/auth';
import z from 'zod';

export const scrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(singleUrlImportSchema)
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.create({
      data: {
        url: data.url,
        userId: context.session.user.id,
        status: 'PROCESSING',
      },
    });
    try {
      const res = await firecrawl.scrape(data.url, {
        formats: [
          'markdown',
          {
            type: 'json',
            // schema: extractSchema,
            prompt: 'please extract the author and publishedAt timestamp',
          },
        ],
        onlyMainContent: true,
        location: { country: 'US', languages: ['en'] },
        proxy: 'auto',
      });
      const result = res.json as ExtractSchemaType;

      let publishedAt = null;

      if (result.publishedAt) {
        const parsed = new Date(result.publishedAt);

        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed;
        }
      }

      const updated = await prisma.savedItem.update({
        where: { id: item.id },
        data: {
          status: 'COMPLETED',
          title: res.metadata?.title,
          content: res.markdown,
          ogImage: res.metadata?.ogImage,
          author: result.author,
          publishedAt: publishedAt,
        },
      });

      return updated;
    } catch {
      const failedItems = await prisma.savedItem.update({
        where: { id: item.id },
        data: {
          status: 'FAILED',
        },
      });

      return failedItems;
    }
  });

export const mapUrls = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(bulkImportSchema)
  .handler(async ({ data }) => {
    const res = await firecrawl.map(data.url, {
      limit: 15,
      search: data.searchQuery,
      location: {
        country: 'US',
        languages: ['en'],
      },
    });

    return res.links;
  });

export const bulkScrape = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      urls: z.array(z.url()),
    }),
  )
  .handler(async ({ data, context }) => {
    for (let i = 0; i < data.urls.length; i++) {
      const url = data.urls[i];
      const item = await prisma.savedItem.create({
        data: {
          url,
          userId: context.session.user.id,
          status: 'PENDING',
        },
      });

      try {
        const res = await firecrawl.scrape(url, {
          formats: [
            'markdown',
            {
              type: 'json',
              // schema: extractSchema,
              prompt: 'please extract the author and publishedAt timestamp',
            },
          ],
          onlyMainContent: true,
          location: { country: 'US', languages: ['en'] },
          proxy: 'auto',
        });
        const result = res.json as ExtractSchemaType;

        let publishedAt = null;

        if (result.publishedAt) {
          const parsed = new Date(result.publishedAt);

          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed;
          }
        }

        await prisma.savedItem.update({
          where: { id: item.id },
          data: {
            status: 'COMPLETED',
            title: res.metadata?.title,
            content: res.markdown,
            ogImage: res.metadata?.ogImage,
            author: result.author,
            publishedAt: publishedAt,
          },
        });
      } catch {
        await prisma.savedItem.update({
          where: { id: item.id },
          data: {
            status: 'FAILED',
          },
        });
      }
    }
  });
