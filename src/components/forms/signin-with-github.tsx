import { Github, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useTransition } from 'react';
import { authClient } from '#/lib/auth-client';
import { toast } from 'sonner';

export function SignInWithGithub() {
  const [isGithubPending, startGithubTransition] = useTransition();

  function onGithubSignIn() {
    startGithubTransition(async () => {
      const { error } = await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/dashboard',
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
