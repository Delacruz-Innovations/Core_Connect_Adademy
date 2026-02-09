-- Migration: Restore Universal Admin Visibility
-- Objective: Ensure 'applications' and 'courses' are visible for Direct Dashboard Access (anon).
-- This fixes the issue where the "Application Desk" appears empty.

-- 1. Applications Table Visibility
-- We keep RLS enabled but add a SELECT policy for anon to support the stats/table view.
DROP POLICY IF EXISTS "Enable select for anon (admissions)" ON public.applications;
CREATE POLICY "Enable select for anon (admissions)" 
ON public.applications FOR SELECT 
TO anon, authenticated 
USING (true);

-- 2. Courses Table Visibility
-- Ensure all courses are visible for the application/registration desk.
DROP POLICY IF EXISTS "Enable select for all (courses)" ON public.courses;
CREATE POLICY "Enable select for all (courses)" 
ON public.courses FOR SELECT 
TO anon, authenticated 
USING (true);

-- 3. Profiles Table Visibility (For dashboard stats)
DROP POLICY IF EXISTS "Enable select for all (profiles)" ON public.profiles;
CREATE POLICY "Enable select for all (profiles)" 
ON public.profiles FOR SELECT 
TO anon, authenticated 
USING (true);

-- 4. Enrollments Table Visibility (For recent activity)
DROP POLICY IF EXISTS "Enable select for all (enrollments)" ON public.enrollments;
CREATE POLICY "Enable select for all (enrollments)" 
ON public.enrollments FOR SELECT 
TO anon, authenticated 
USING (true);

-- 5. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
