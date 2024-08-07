// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  // Protect routes under /api/(protected) and /(main), but allow /api/auth
  if ((request.nextUrl.pathname.startsWith('/api/(protected)') || 
       request.nextUrl.pathname.startsWith('/(main)')) && 
       !request.nextUrl.pathname.startsWith('/api/auth')) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Redirect to login if there's no auth token
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // The actual token verification will be done in the API route
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/(protected)/:path*', '/(main)/:path*', '/api/auth'],
};