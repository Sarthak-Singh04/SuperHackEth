'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Login() {
  const { login, ready, authenticated, user } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated && user) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, user, router]);

  if (!ready) return null;
  if (ready && authenticated) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl">Privy Login</h1>
      <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={login}>
        Log in
      </button>
    </main>
  );
}