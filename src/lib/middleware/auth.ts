import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '../auth';
import { redirect } from '@tanstack/react-router';

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw redirect({ to: '/login' });
    }

    return next({ context: { session } });
  },
);

export const authedRequestMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ next, request }) => {
  const url = new URL(request.url);

  if (
    !url.pathname.startsWith('/dashboard') &&
    !url.pathname.startsWith('/api')
  ) {
    return next();
  }

  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw redirect({ to: '/login' });
  }

  return next({ context: { session } });
});
