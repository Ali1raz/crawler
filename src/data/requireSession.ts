import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { redirect } from '@tanstack/react-router';
import z from 'zod';

export const getSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return session;
  },
);

export const requireSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw redirect({ to: '/login', search: { returnTo: undefined } });
    }

    return session;
  },
);

export const requireSessionWithReturnTo = createServerFn({ method: 'GET' })
  .inputValidator(
    z
      .object({
        returnTo: z.string().optional(),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
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

    const returnTo =
      data?.returnTo && data.returnTo.startsWith('/')
        ? data.returnTo
        : fallbackFromReferer;

    if (!session) {
      throw redirect({
        to: '/login',
        search: { returnTo: returnTo ?? undefined },
      });
    }

    return session;
  });
