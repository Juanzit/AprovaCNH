import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

/**
 * Compartilha uma única leitura de sessão/autenticação por renderização no servidor.
 * Evita repetir auth.getUser() em Home, Trilha e Revisão, inclusive para visitantes.
 */
export const getSupabaseAuthContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
});
