import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  const privyUserId = request.headers.get('X-Privy-User-Id');
  
  if (!privyUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { privyUserId },
      select: {
        id: true,
        email: true,
        appleEmail: true,
        googleEmail: true,
        twitterUsername: true,
        walletAddress: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}