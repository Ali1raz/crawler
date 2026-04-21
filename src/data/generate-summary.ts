import { prisma } from '#/db';
import { authMiddleware } from '#/lib/middleware/auth';
import { createServerFn } from '@tanstack/react-start';
import { notFound } from '@tanstack/react-router';
import z from 'zod';
import { model } from '#/lib/open-router';
import { generateText } from 'ai';

export const saveSummaryTags = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ id: z.string(), summary: z.string() }))
  .handler(async ({ data, context }) => {
    const existing = await prisma.savedItem.findUnique({
      where: {
        id: data.id,
        userId: context.session.user.id,
      },
    });

    if (!existing) {
      throw notFound();
    }

    const { text } = await generateText({
      model: model,
      system:
        'You are a helpfulll assisstant that extracts relevant tags from content summaries. Extract 3-5 short, relevant tags that categorize content. Return only a comma-separated list of tags, nothing else. For example technology, programming, web development.',
      prompt: `Extract tags from this summary: \n\n${data.summary}`,
    });

    const tags = text
      .split(',')
      .map((tag) => tag.trim().toUpperCase())
      .slice(0, 5);

    const item = await prisma.savedItem.update({
      where: {
        id: data.id,
        userId: context.session.user.id,
      },
      data: {
        summary: data.summary,
        tags,
      },
    });

    return item;
  });
