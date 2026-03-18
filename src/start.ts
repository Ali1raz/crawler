import { createMiddleware, createStart } from '@tanstack/react-start';
import { authedRequestMiddleware } from './lib/middleware/auth';

export const requestMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ request, next }) => {
    const url = new URL(request.url);

    console.log(`[${request.method}] ${url.pathname}`);

    return next();
  },
);

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [requestMiddleware, authedRequestMiddleware],
  };
});
