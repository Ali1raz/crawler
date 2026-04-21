import { env } from '#/env';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const openrouter = createOpenRouter({
  apiKey: env.AI_API_KEY,
});

export const model = openrouter.chat('nvidia/nemotron-3-super-120b-a12b:free');
