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
  component: RouteComponent,
  loader: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: '/login',
        search: { returnTo: location.href },
      });
    }

    const sessions = await listAllSessions();

    return {
      user: session.user,
      currentSessionToken: session.session.token,
      sessions,
    };
  },
});

function RouteComponent() {
  const { user, sessions, currentSessionToken } = Route.useLoaderData();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const sortedSessions = [...sessions].sort(
    (a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime(),
  );

  const handleRevoke = (token: string) => {
    startTransition(async () => {
      try {
        setPendingToken(token);
        await revokeSingleSession({ data: { token } });
        await router.invalidate();
        toast.success('Session revoked successfully');
      } catch {
        toast.error('Failed to revoke session');
      } finally {
        setPendingToken(null);
      }
    });
  };

  return (
    <div className="max-w-6xl flex flex-col gap-4 items-center h-screen justify-center mx-auto sm:px-6 px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <h1>Manage your profile</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Profileform user={user} />
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Manage your sessions across devices</CardTitle>
          <CardDescription>
            Review active sessions and revoke access for a specific device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sortedSessions.map((session) => {
            const token = session.token;
            const isCurrentSession = token === currentSessionToken;
            const isRevoking = isPending && pendingToken === token;

            return (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle>{getDeviceLabel(session.userAgent)}</CardTitle>
                  <CardDescription>
                    Started {getRelativeDate(session.createdAt)}
                  </CardDescription>
                  <CardAction className="flex justify-end gap-2">
                    {isCurrentSession && (
                      <Badge className="w-fit">Current device</Badge>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      className={cn(
                        isRevoking && isCurrentSession && 'cursor-not-allowed',
                      )}
                      disabled={isCurrentSession || !token || isRevoking}
                      onClick={() => token && handleRevoke(token)}
                    >
                      {isRevoking ? 'Revoking...' : 'Revoke'}
                    </Button>
                  </CardAction>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div>Signed in: {getFullDate(session.createdAt)}</div>
                  <div>Expires: {getFullDate(session.expiresAt)}</div>
                  <div>IP Address: {session.ipAddress || 'Unavailable'}</div>
                  <div className="break-all">
                    User agent: {session.userAgent || 'Unavailable'}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
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
