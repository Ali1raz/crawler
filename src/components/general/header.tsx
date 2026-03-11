import { authClient } from '#/lib/auth-client';
import { cn } from '#/lib/utils';
import { Link } from '@tanstack/react-router';
import { Button, buttonVariants } from '../ui/button';
import { MobileNav } from './mobile-nav';
import { useSignOut } from '#/hooks/use-signout';
import { useScroll } from '#/hooks/use-scroll';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const scrolled = useScroll(10);
  const { isPending, data: session } = authClient.useSession();
  const handleSignOut = useSignOut();

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-transparent border-b', {
        'border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50':
          scrolled,
      })}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center px-4">
        <Link className="p-2" to="/">
          <img
            alt="Logo"
            height="24"
            src="/logo512.png"
            width="24"
            className="invert dark:invert-0"
          />
        </Link>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />

          {!isPending && session ? (
            <>
              <Link to="/dashboard" className={buttonVariants({ size: 'sm' })}>
                Dashboard
              </Link>
              <Button
                onClick={handleSignOut}
                className="cursor-pointer"
                size="sm"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
              >
                Login
              </Link>
              <Link to="/register" className={buttonVariants({ size: 'sm' })}>
                Get Started
              </Link>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
