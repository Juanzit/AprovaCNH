-- Migration: 20261108000001_grant_permissions.sql
-- Concede permissões para as roles do PostgREST (anon e authenticated)
-- permitindo que as políticas de RLS sejam avaliadas pelo PostgreSQL.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.questions TO anon, authenticated;
GRANT SELECT ON TABLE public.question_sources TO anon, authenticated;
GRANT SELECT ON TABLE public.question_reviews TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
