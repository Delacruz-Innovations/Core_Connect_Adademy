-- Migration: Pure Admin Access & Data Fetching Fix
-- Objective: Ensure authenticated admins have FULL and UNRESTRICTED access to all tables.

-- 1. Helper function to check admin role (caches result for the session)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. COURSES: Grant Pure Admin access
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Also ensure admins can see UNPUBLISHED courses
-- (The existing public policy only allows published ones)
DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
CREATE POLICY "Public can view published courses"
ON public.courses FOR SELECT TO anon, authenticated
USING (is_published = true OR public.is_admin());

-- 3. ENROLLMENTS: Grant Pure Admin access
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
CREATE POLICY "Admins can view all enrollments"
ON public.enrollments FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert enrollments" ON public.enrollments;
CREATE POLICY "Admins can insert enrollments"
ON public.enrollments FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update enrollments" ON public.enrollments;
CREATE POLICY "Admins can update enrollments"
ON public.enrollments FOR UPDATE TO authenticated
USING (public.is_admin());

-- 4. MODULES & LESSONS: Grant Pure Admin access
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
CREATE POLICY "Admins can manage modules"
ON public.modules FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons"
ON public.lessons FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. LEADS: Grant Pure Admin access
DROP POLICY IF EXISTS "Allow admins to manage leads" ON public.leads;
CREATE POLICY "Allow admins to manage leads"
ON public.leads FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. AUDIT LOGS: Grant Pure Admin access
DROP POLICY IF EXISTS "Admins only read audit logs" ON public.audit_logs;
CREATE POLICY "Admins only read audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_admin());

-- 7. PROFILES: Ensure admins can see all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin());

-- 8. EMERGENCY ADMIN LOG-IN (Self-Correcting Role)
-- If an authenticated user enters the admin portal, ensure we don't block them if they ARE the primary admin
-- This is a safety net for the first admin setup.
-- 8. EMERGENCY ADMIN LOG-IN (Self-Correcting Role)
-- If an authenticated user enters the admin portal, ensure we don't block them if they ARE the primary admin
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id 
AND u.email = 'delacruz@coreconnect.com';

COMMENT ON FUNCTION public.is_admin() IS 'Centralized check for admin privileges. Ensures pure access for dashboards.';
