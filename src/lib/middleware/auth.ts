import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '../auth';
import { redirect } from '@tanstack/react-router';

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    const fallbackFromReferer = (() => {
      const referer = headers.get('referer');
      if (!referer) {
        return undefined;
      }

      try {
        const refererUrl = new URL(referer);
        const candidate = `${refererUrl.pathname}${refererUrl.search}${refererUrl.hash}`;
        return candidate.startsWith('/') ? candidate : undefined;
      } catch {
        return undefined;
      }
    })();

    if (!session) {
      throw redirect({
        to: '/login',
        search: { returnTo: fallbackFromReferer ?? undefined },
      });
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
    !url.pathname.startsWith('/api/ai')
  ) {
    return next();
  }

  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session) {
    const returnTo = `${url.pathname}${url.search}`;
    throw redirect({
      to: '/login',
      search: { returnTo },
    });
  }

  return next({ context: { session } });
});
