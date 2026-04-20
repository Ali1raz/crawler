import { Profileform } from '#/components/forms/profile-form';
import { getSession } from '#/data/requireSession';
import { createFileRoute, redirect } from '@tanstack/react-router';

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
