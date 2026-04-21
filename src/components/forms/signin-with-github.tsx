import { Github, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useTransition } from 'react';
import { authClient } from '#/lib/auth-client';
import { toast } from 'sonner';
import { parseAsString, useQueryState } from 'nuqs';

export function SignInWithGithub() {
  const [isGithubPending, startGithubTransition] = useTransition();
  const [returnTo] = useQueryState('returnTo', parseAsString);
  const callbackURL = returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard';

  function onGithubSignIn() {
    startGithubTransition(async () => {
      const { error } = await authClient.signIn.social({
        provider: 'github',
        callbackURL,
      });
      if (error) {
        toast.error(error.message ?? 'GitHub login failed');
        return;
      }
    });
  }

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full"
      onClick={onGithubSignIn}
      disabled={isGithubPending}
    >
      <Github />
      {isGithubPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Loading ...
        </>
      ) : (
        <span>Login with GitHub</span>
      )}
    </Button>
  );
}
