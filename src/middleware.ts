import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './app/utils/jwt';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add the user ID to the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-User-ID', decoded.userId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/((?!api/login|login|api/register|register|_next).*)',
};