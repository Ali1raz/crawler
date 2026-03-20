import { prisma } from '#/db';
import { model } from '#/lib/open-router';
import { createFileRoute } from '@tanstack/react-router';
import { streamText } from 'ai';

export const Route = createFileRoute('/api/ai/summary')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const { itemId, prompt } = await request.json();
        console.log('Received request with itemId:', itemId);

        if (!itemId || !prompt) {
          return new Response('Missing itemId or prompt', { status: 400 });
        }

        const item = await prisma.savedItem.findUnique({
          where: {
            id: itemId,
            userId: context?.session.user.id,
          },
        });

        if (!item) {
          return new Response('Item not found', { status: 404 });
        }

        const result = streamText({
          model: model,
          system: `You are a helpful assistant that creates concise and informative summaries of web articles. Your summaries should - be 2-3 paragraphs long, - capture the main points and key details, - be written in a clear and professional tone, - avoid personal opinions or interpretations, - be suitable for a general audience. Always base your summary solely on the content of the article provided.`,
          prompt: `Please summarize the following content: \n\n${item.content}`,
        });

        return result.toTextStreamResponse();
      },
    },
  },
});
