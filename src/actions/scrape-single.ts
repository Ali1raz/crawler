import { createServerFn } from '@tanstack/react-start';

export const scrapeUrlFn = createServerFn({ method: 'POST' }).middleware([]);
