import { discoverSchema } from '#/components/forms/schema';
import { firecrawl } from '#/lib/firecrawl';
import { authMiddleware } from '#/lib/middleware/auth';
import type { SearchResultWeb } from '@mendable/firecrawl-js';
import { createServerFn } from '@tanstack/react-start';

export const discoverWebLinks = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(discoverSchema)
  .handler(async ({ data }) => {
    const results = await firecrawl.search(data.query, {
      limit: 10,
      scrapeOptions: { formats: ['markdown'] },
      sources: ['web'],
      location: 'US',
      //   categories: ['']
    });

    return results.web as SearchResultWeb[];
  });
