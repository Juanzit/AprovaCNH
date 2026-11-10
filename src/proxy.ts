import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

/**
 * In Next.js 16 this request boundary is named Proxy (proxy.ts).
 * Supabase email confirmations may return to "/?code=..."; send the code to
 * the Route Handler before getUser() runs so exchangeCodeForSession can create
 * the PKCE session cookies in the same browser request.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === '/' && searchParams.has('code')) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = '/auth/callback';
    callbackUrl.searchParams.set('next', '/');
    return NextResponse.redirect(callbackUrl);
  }

  // Direct /auth/callback links must also reach the exchange handler untouched.
  if (pathname === '/auth/callback' && searchParams.has('code')) {
    return NextResponse.next({ request });
  }

  const { supabaseResponse } = await updateSession(request);
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
