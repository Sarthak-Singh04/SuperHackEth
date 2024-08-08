'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';

export default function Login() {
  const { login, ready, authenticated, user, getAccessToken } = usePrivy();
  const router = useRouter();

  const syncUserData = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      if (response.ok) {
        const data = await response.json();
      } else {
        console.error('Failed to sync user data');
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  }, [getAccessToken, user]);

  useEffect(() => {
    if (ready && authenticated && user) {
      syncUserData().then(() => {
        router.push('/home');
      });
    }
  }, [ready, authenticated, user, router, syncUserData]);

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