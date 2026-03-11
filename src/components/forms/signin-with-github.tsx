import { Github } from 'lucide-react';
import { Button } from '../ui/button';
import { useTransition } from 'react';
import { authClient } from '#/lib/auth-client';
import { toast } from 'sonner';

export function SignInWithGithub() {
  const [isGithubPending, startGithubTransition] = useTransition();

  function onGithubSignIn() {
    startGithubTransition(async () => {
      const { error } = await authClient.signIn.social({ provider: 'github' });
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
      Login with GitHub
    </Button>
  );
}
