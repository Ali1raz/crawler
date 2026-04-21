import { prisma } from '#/db';
import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env } from '#/env';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  baseURL: env.VITE_BETTER_AUTH_URL,
  trustedOrigins: [
    env.VITE_BETTER_AUTH_URL,
    env.SERVER_URL ?? 'http://localhost:3005',
  ],

  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [tanstackStartCookies()],
});
