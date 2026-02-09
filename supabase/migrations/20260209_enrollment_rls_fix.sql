-- Migration: Master Enrollment Authority Fix
-- Description: Ensures admins have absolute power over enrollments regardless of table drops/recreations.

-- 1. Ensure enrollments table has RLS enabled
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 2. Grant ALL privileges to authenticated admins
DROP POLICY IF EXISTS "Admin God Policy" ON public.enrollments;
DROP POLICY IF EXISTS "Admins manage everything on enrollments" ON public.enrollments;

CREATE POLICY "Admin Authority: Enrollments"
ON public.enrollments
FOR ALL
TO authenticated
USING (public.check_is_admin())
WITH CHECK (public.check_is_admin());

-- 3. Also allow SELECT for students (to see their own dashboard)
DROP POLICY IF EXISTS "Students view own enrollments" ON public.enrollments;
CREATE POLICY "Students view own enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- 4. Open up Courses and Applications for the Admin Portal queries
DROP POLICY IF EXISTS "Admin Authority: Courses" ON public.courses;
CREATE POLICY "Admin Authority: Courses"
ON public.courses FOR ALL
TO authenticated
USING (public.check_is_admin())
WITH CHECK (public.check_is_admin());

DROP POLICY IF EXISTS "Admin Authority: Applications" ON public.applications;
CREATE POLICY "Admin Authority: Applications"
ON public.applications FOR ALL
TO authenticated
USING (public.check_is_admin())
WITH CHECK (public.check_is_admin());

-- 5. EMERGENCY: If AdminGuard is decommissioned, we might need a fallback for 'yiwina2184@icubik.com' 
-- Ensure this user is ALWAYS admin.
UPDATE public.profiles SET role = 'admin' WHERE email = 'yiwina2184@icubik.com';
