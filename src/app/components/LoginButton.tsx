'use client'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'

export function LoginButton() {
  const { login, authenticated, ready } = usePrivy()
  const router = useRouter()

  if (!ready) return null

  const handleClick = async () => {
    if (authenticated) {
      router.push('/dashboard')
    } else {
      login()
    }
  }

  return (
    <button onClick={handleClick}>
      {authenticated ? 'Go to Dashboard' : 'Login with Privy'}
    </button>
  )
}