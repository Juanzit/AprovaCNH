import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/** Auth context compartilhado por request; visitantes sem cookie não consultam Auth pela rede. */
export const getSupabaseAuthContext = cache(async () => {
  const supabase = await createClient();
  let cookieContextAvailable = false;
  let hasSessionCookie = false;

  try {
    const cookieStore = await cookies();
    cookieContextAvailable = true;
    hasSessionCookie = cookieStore.getAll().some(({ name }) =>
      name.startsWith('sb-') &&
      name.includes('-auth-token') &&
      !name.includes('code-verifier')
    );
  } catch {
    // Em testes/scripts fora do request scope, preserva o comportamento normal do cliente mockado.
  }

  if (cookieContextAvailable && !hasSessionCookie) {
    return { supabase, user: null };
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
});
