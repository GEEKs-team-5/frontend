import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const proxy = (request: NextRequest) => {
  if (request.cookies.has('accessToken')) return NextResponse.next();

  const signInUrl = new URL('/signin', request.url);
  signInUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(signInUrl);
};

export const proxyConfig = {
  matcher: ['/home/:path*', '/medications/:path*', '/report/:path*', '/settings/:path*'],
};
