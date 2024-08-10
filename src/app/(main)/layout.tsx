'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarDesktop } from '@/components/Sidebar';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  if (!ready) return <div>Loading...</div>;
  if (!authenticated) return null; 
  return (
    <div>
      <SidebarDesktop />
      <main className='ml-[19rem] pt-4'>
        {children}
      </main>
    </div>
  );
}