import { PrivyClient } from '@privy-io/server-auth';

console.log("Server-side Privy App ID:", process.env.NEXT_PUBLIC_PRIVY_ID);
console.log("Server-side Privy App Secret:", process.env.PRIVY_APP_SECRET);

export const privyServer = new PrivyClient(
    process.env.NEXT_PUBLIC_PRIVY_ID!,
    process.env.PRIVY_APP_SECRET!
  );