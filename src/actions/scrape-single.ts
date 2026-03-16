import { firecrawl } from '#/lib/firecrawl';
import { createServerFn } from '@tanstack/react-start';
import {
  extractSchema,
  singleUrlImportSchema,
  type ExtractSchemaType,
} from '#/components/forms/schema';
import { prisma } from '#/db';
import { getSession, requireSession } from '#/data/requireSession';

export const scrapeUrlFn = createServerFn({ method: 'POST' })
  .inputValidator(singleUrlImportSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();

    const item = await prisma.savedItem.create({
      data: {
        url: data.url,
        userId: session?.user.id,
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
      });
      const result = res.json as ExtractSchemaType;
      console.log({ result });

      const updated = await prisma.savedItem.update({
        where: { id: item.id },
        data: {
          status: 'COMPLETED',
          title: res.metadata?.title,
          content: res.markdown,
          ogImage: res.metadata?.ogImage,
          author: result.author,
          publishedAt: result.publishedAt,
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
