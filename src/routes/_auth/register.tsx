import { createFileRoute, redirect } from '@tanstack/react-router';
import { RegisterForm } from '#/components/forms/register';
import { getSession } from '#/data/requireSession';

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
  beforeLoad: async () => {
    // If the user is already authenticated, redirect to the /
    const session = await getSession();

    if (session) {
      throw redirect({ to: '/' });
    }
  },
});

function RouteComponent() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details to get started
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
