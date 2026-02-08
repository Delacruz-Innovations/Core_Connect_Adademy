-- Migration: Universal Admin Access
-- Objective: Remove all RLS restrictions for admin tables to allow anonymous/unauthenticated access.
-- WARNING: This migration facilitates direct dashboard access by bypassing all security layers.

-- 1. Disable RLS on admin-controlled tables
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('courses', 'modules', 'lessons', 'enrollments', 'leads', 'audit_logs', 'notifications', 'profiles', 'applications')
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 2. Grant all privileges to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 3. Mock the check_is_admin function to always permit
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_is_admin() IS 'Universal Permission: Always returns true for direct dashboard access.';
