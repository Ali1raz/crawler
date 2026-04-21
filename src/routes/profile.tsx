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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { listAllSessions, revokeSingleSession } from '#/data/get-all-sessions';
import { getSession } from '#/data/requireSession';
import { authClient } from '#/lib/auth-client';
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
  const { returnTo } = Route.useSearch();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAccountPending, startAccountTransition] = useTransition();
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

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

  const handleSignOut = () => {
    startAccountTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.navigate({
              to: '/login',
              search: {
                returnTo:
                  typeof returnTo === 'string' && returnTo.startsWith('/')
                    ? returnTo
                    : '/dashboard',
              },
            });
            toast.success('Logged out successfully');
          },
          onError: ({ error }) => {
            toast.error(error.message || 'Failed to log out');
          },
        },
      });
    });
  };

  const handleDeleteAccount = () => {
    if (!deletePassword.trim()) {
      toast.error('Password is required to delete your account');
      return;
    }

    startAccountTransition(async () => {
      await authClient.deleteUser({
        password: deletePassword,
        fetchOptions: {
          onSuccess: () => {
            toast.success('Account deleted successfully');
            setDeletePassword('');
            setIsDeleteDialogOpen(false);
            router.navigate({
              to: '/register',
              search: {
                returnTo:
                  typeof returnTo === 'string' && returnTo.startsWith('/')
                    ? returnTo
                    : '/dashboard',
              },
            });
          },
          onError: ({ error }) => {
            toast.error(error.message || 'Failed to delete account');
          },
        },
      });
    });
  };

  return (
    <div className="max-w-6xl flex flex-col gap-4 items-center h-screen justify-center mx-auto sm:px-6 px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <h1>Manage your profile</h1>
          </CardTitle>
          <CardDescription>
            Update your account details or manage account access.
          </CardDescription>
          <CardAction className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isAccountPending || isDeleteDialogOpen}
              onClick={handleSignOut}
            >
              {isAccountPending ? 'Processing...' : 'Log out'}
            </Button>
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) {
                  setDeletePassword('');
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isAccountPending}
                >
                  Delete account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete account</DialogTitle>
                  <DialogDescription>
                    Enter your password to permanently delete your account. This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="delete-account-password">
                      Password
                    </FieldLabel>
                    <Input
                      id="delete-account-password"
                      type="password"
                      value={deletePassword}
                      autoComplete="current-password"
                      onChange={(e) => setDeletePassword(e.target.value)}
                    />
                  </Field>
                </FieldGroup>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isAccountPending}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    disabled={isAccountPending || !deletePassword.trim()}
                    onClick={handleDeleteAccount}
                  >
                    {isAccountPending ? 'Deleting...' : 'Delete permanently'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardAction>
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
