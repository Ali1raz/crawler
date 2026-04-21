import { getSession } from '#/data/requireSession';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: '/login',
        search: { returnTo: location.href },
      });
    }

    throw redirect({ to: '/dashboard/import' });
  },
});

function RouteComponent() {
  return (
    <div>
      <div>Hello</div>
    </div>
  );
}
