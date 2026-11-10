import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Administrativo do Servidor (Service Role).
 * EXCLUSIVO DO SERVIDOR: Nunca importar em Client Components nem expor chaves públicas.
 * Utilizado estritamente para avaliação autoritativa de respostas e auditoria editorial.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL não configuradas para acesso administrativo.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
