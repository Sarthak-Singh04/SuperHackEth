// src/app/page.tsx

'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();

  if (!ready) return <></>;
  
  if (ready && authenticated) {
    router.push('/home');
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-2xl">Privy Login</h1>
      <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={login}>
        Log in
      </button>
    </main>
  );
}