import { Profileform } from '#/components/forms/profile-form';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card';
import { listAllSessions, revokeSingleSession } from '#/data/get-all-sessions';
import { getSession } from '#/data/requireSession';
import { cn } from '#/lib/utils';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { format, formatDistanceToNow } from 'date-fns';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/profile')({
  validateSearch: (search) => ({
    returnTo:
      typeof search.returnTo === 'string' && search.returnTo.startsWith('/')
        ? search.returnTo
        : undefined,
  }),
  component: RouteComponent,
  loader: async ({ location }) => {
    const session = await getSession();
    if (!session) {
      throw redirect({
        to: '/login',
        search: { returnTo: location.href },
      });
    }
    return session.user;
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return <div className='max-w-6xl mx-auto sm:px-6 px-4'>
    <h1>Update your profile</h1>
    <Profileform user={data} />
  </div>;
}

const toDate = (date: Date | string) =>
  typeof date === 'string' ? new Date(date) : date;

const getFullDate = (date: Date | string) => {
  return format(toDate(date), 'PPP p');
};

const getRelativeDate = (date: Date | string) => {
  return formatDistanceToNow(toDate(date), { addSuffix: true });
};

const getDeviceLabel = (userAgent?: string | null) => {
  if (!userAgent) return 'Unknown device';

  const ua = userAgent.toLowerCase();
  const os = ua.includes('windows')
    ? 'Windows'
    : ua.includes('mac os') || ua.includes('macintosh')
      ? 'macOS'
      : ua.includes('android')
        ? 'Android'
        : ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')
          ? 'iOS'
          : ua.includes('linux')
            ? 'Linux'
            : 'Unknown OS';

  const browser = ua.includes('edg/')
    ? 'Edge'
    : ua.includes('chrome/')
      ? 'Chrome'
      : ua.includes('firefox/')
        ? 'Firefox'
        : ua.includes('safari/')
          ? 'Safari'
          : 'Unknown browser';

  return `${browser} on ${os}`;
};
