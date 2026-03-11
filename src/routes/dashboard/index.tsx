import { getSession } from '#/data/requireSession';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: '/login' });
    }

    return { user: session.user };
  },
  loader: async ({ context }) => {
    return context.user;
  },
});

function RouteComponent() {
  const user = Route.useLoaderData();

  return (
    <div>
      <div>Hello {user.name}!</div>
    </div>
  );
}
