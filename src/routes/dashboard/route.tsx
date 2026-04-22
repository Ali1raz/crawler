import { ThemeToggle } from '#/components/general/theme-toggle';
import { AppSidebar } from '#/components/sidebar/app-sidebar';
import { Separator } from '#/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar';
import { requireSessionWithReturnTo } from '#/data/requireSession';
import { Link } from '@tanstack/react-router';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  loader: async ({ location }) => {
    const session = await requireSessionWithReturnTo({
      data: { returnTo: location.href },
    });
    return {
      user: session.user,
    };
  },
});

function RouteComponent() {
  const { user } = Route.useLoaderData();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 border-b border-secondary shrink-0 items-center px-4 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Link className="p-2" to="/">
                <img
                  alt="Logo"
                  height="24"
                  src="/logo512.png"
                  width="24"
                  className="invert dark:invert-0"
                />
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 max-w-5xl flex-col gap-4 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
