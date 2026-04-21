import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '#/components/forms/login-form';
import { getSession } from '#/data/requireSession';

export const Route = createFileRoute('/_auth/login')({
  validateSearch: (search) => ({
    returnTo:
      typeof search.returnTo === 'string' && search.returnTo.startsWith('/')
        ? search.returnTo
        : undefined,
  }),
  component: RouteComponent,
  beforeLoad: async ({ search }) => {
    // If the user is already authenticated, redirect to the /
    const session = await getSession();

    if (session) {
      throw redirect({ to: search.returnTo ?? '/' });
    }
  },
});

function RouteComponent() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to continue
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
