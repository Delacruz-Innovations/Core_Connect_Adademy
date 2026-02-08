-- CANONICAL ADMIN AUTH & AUTHORITY (FROZEN V1)
-- This migration implements the "One-Page Admin Auth State Machine (v1 — Frozen)"
-- It establishes the database as the final authority and ensures absolute traceability.

-- 1. ENUMS & TYPES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'registered_user', 'student');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. PROFILE TABLE HARDENING
-- Identity is managed by auth.users. We store role and name here.
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    role public.user_role DEFAULT 'registered_user',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ensure the email column exists if any old triggers or queries depend on it
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- 3. AUDIT LOG STANDARDIZATION
-- We ensure the table exists with the canonical "actor" columns
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id uuid REFERENCES auth.users(id),
    actor_role text NOT NULL,
    action text NOT NULL,
    entity_type text,
    entity_id text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Ensure old columns are mapped or dropped to avoid ambiguity
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='event_type') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN event_type TO action;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='details') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN details TO metadata;
    END IF;
EXCEPTION WHEN others THEN null; END $$;

-- 4. THE CANONICAL ADMIN CHECK (SECURITY DEFINER)
-- This is the ONLY way RLS should check for admin authority.
-- It bypasses RLS on 'profiles' to prevent recursive loops.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. THE GLOBAL "ADMIN GOD" POLICIES
-- We apply a deterministic "All or Nothing" policy to admin tables
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('courses', 'modules', 'lessons', 'enrollments', 'leads', 'audit_logs', 'notifications', 'profiles')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin God Policy" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Admin God Policy" ON public.%I FOR ALL TO authenticated USING (public.check_is_admin()) WITH CHECK (public.check_is_admin())', t);
    END LOOP;
END $$;

-- 6. IMMUTABLE AUDIT LOGS
-- Admins can READ, but NO ONE (not even admins) can UPDATE or DELETE logs.
DROP POLICY IF EXISTS "Admin God Policy" ON public.audit_logs;
CREATE POLICY "Admins can read logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.check_is_admin());
CREATE POLICY "System can insert logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

-- 7. PROFILE SECURITY (Standard User Access)
-- Each user can see their own profile. Admin God Policy handles admin visibility.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- 8. BOOTSTRAP: THE FIRST ADMIN
-- Use this one-time update to promote the system owner via email join.
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id 
AND u.email = 'yiwina2184@icubik.com';

INSERT INTO public.audit_logs (actor_id, actor_role, action, metadata)
SELECT p.id, 'admin', 'SYSTEM_BOOTSTRAP', '{"message": "First admin promoted via Canonical Law migration"}'
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'yiwina2184@icubik.com'
ON CONFLICT DO NOTHING;

COMMENT ON FUNCTION public.check_is_admin() IS 'Canonical law: Final authority check for administrative operations.';
