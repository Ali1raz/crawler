'use client'

import { authClient } from '@/lib/auth-client'
// import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

export function useSignOut() {
  // const router = useRouter()

  const handleSignOut = async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // router.navigate('/login')
          toast.success('Successfully signed out!')
        },
        onError: () => {
          toast.error('Failed to sign out')
        },
      },
    })
  }
  return handleSignOut
}
