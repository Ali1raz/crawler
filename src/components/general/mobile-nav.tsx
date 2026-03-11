import { cn } from '@/lib/utils'
import React from 'react'
import { XIcon, MenuIcon } from 'lucide-react'
import { Button, buttonVariants } from '../ui/button'
import { Portal, PortalBackdrop } from '../ui/portal'
import { authClient } from '#/lib/auth-client'
import { useSignOut } from '#/hooks/use-signout'
import { Link } from '@tanstack/react-router'

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { isPending, data: session } = authClient.useSession()
  const handleSignOut = useSignOut()

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        {open ? (
          <XIcon className="size-4.5" />
        ) : (
          <MenuIcon className="size-4.5" />
        )}
      </Button>
      {open && (
        <Portal className="top-14" id="mobile-menu">
          <PortalBackdrop />
          <div
            className={cn(
              'data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in',
              'size-full p-4',
            )}
            data-slot={open ? 'open' : 'closed'}
          >
            <div className="mt-12 flex flex-col gap-2">
              {!isPending && session ? (
                <>
                  <Link
                    to="/dashboard"
                    className={buttonVariants({ className: 'w-full' })}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      handleSignOut()
                      setOpen(false)
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={buttonVariants({
                      variant: 'outline',
                      className: 'w-full',
                    })}
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={buttonVariants({ className: 'w-full' })}
                    onClick={() => setOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
