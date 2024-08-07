'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const router = useRouter();
  const [serverData, setServerData] = useState(null);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    async function syncUserData() {
      if (authenticated && user) {
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
            setServerData(data);
          } else {
            console.error('Failed to sync user data');
          }
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      }
    }

    syncUserData();
  }, [authenticated, user, getAccessToken]);

  if (!ready || !authenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>User ID: {user.id}</p>
      <p>Created At: {new Date(user.createdAt).toLocaleString()}</p>
      <h2>Linked Accounts:</h2>
      <ul>
        <li>Apple: {user.apple ? user.apple.email : 'None'}</li>
        <li>Email: {user.email ? user.email.address : 'None'}</li>
        <li>Google: {user.google ? user.google.email : 'None'}</li>
        <li>Twitter: {user.twitter ? user.twitter.username : 'None'}</li>
        <li>Wallet: {user.wallet ? user.wallet.address : 'None'}</li>
      </ul>
      {serverData && (
        <div>
          <h2>Server Data:</h2>
          <pre>{JSON.stringify(serverData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
