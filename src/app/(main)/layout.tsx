"use client";
import { usePrivy } from '@privy-io/react-auth';
import { redirect, useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';
import MenuBar from '@/components/Menubar';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { login, authenticated, ready } = usePrivy();

  // Check if user is authenticated and ready
  if (!ready || !authenticated) {
    // If not, redirect to login page or render a login component
    return redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex w-full max-w-7xl grow gap-5 p-5">
        <MenuBar className="sticky  hidden h-screen flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80 border-r"  />
        {children}
      </div>
      <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t border-r bg-card p-3 sm:hidden" />
    </div>
  );
}