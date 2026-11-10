import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/** Auth context compartilhado por request; visitantes não consultam auth.getUser() na rede. */
export const getSupabaseAuthContext = cache(async () => {
  const supabase = await createClient();
  let hasSessionCookie = false;

  try {
    const cookieStore = await cookies();
    hasSessionCookie = cookieStore.getAll().some(({ name }) =>
      name.startsWith('sb-') &&
      name.includes('-auth-token') &&
      !name.includes('code-verifier')
    );
  } catch {
    // Fora de request scope, não há sessão de navegador para validar.
  }

  if (!hasSessionCookie) return { supabase, user: null };

  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
});
