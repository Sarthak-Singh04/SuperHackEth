import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { privyServer } from '@/app/lib/privyServer';



export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verifiedClaims = await privyServer.verifyAuthToken(token);
    const userData = await request.json();

    const result = await prisma.$transaction(async (prismaClient) => {
      const user = await prismaClient.user.upsert({
        where: { privyUserId: verifiedClaims.userId },
        update: {
          email: userData.email?.address,
          walletAddress: userData.wallet?.address,
          appleEmail: userData.apple?.email,
          googleEmail: userData.google?.email,
          twitterUsername: userData.twitter?.username,
          // Add other fields as necessary
        },
        create: {
          privyUserId: verifiedClaims.userId,
          email: userData.email?.address,
          walletAddress: userData.wallet?.address,
          appleEmail: userData.apple?.email,
          googleEmail: userData.google?.email,
          twitterUsername: userData.twitter?.username,
          // Add other fields as necessary
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      userId: result.id,
      privyUserId: result.privyUserId,
      email: result.email,
      walletAddress: result.walletAddress,
      appleEmail: result.appleEmail,
      googleEmail: result.googleEmail,
      twitterUsername: result.twitterUsername,
      // Include other fields you want to return
    });
  } catch (error) {
    console.error('Authentication failed:', error);

    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}