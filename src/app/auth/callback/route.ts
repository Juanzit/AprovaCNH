import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const requestedNext = requestUrl.searchParams.get('next') ?? '/';
  const safeNext =
    requestedNext.startsWith('/') &&
    !requestedNext.startsWith('//') &&
    !requestedNext.includes('\\')
      ? requestedNext
      : '/';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth-callback-failed', requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth-callback-failed', requestUrl.origin));
  }

  // createClient writes the PKCE session cookies through the Route Handler cookie store.
  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
