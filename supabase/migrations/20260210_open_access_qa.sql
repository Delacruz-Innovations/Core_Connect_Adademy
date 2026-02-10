-- 🔓 UNIVERSAL ACCESS: Q&A Visibility for All (Anon + Authenticated)
-- Objective: Ensure questions are visible even if the admin hasn't formally logged in (due to AdminGuard being decommissioned).

ALTER TABLE public.lesson_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin God Policy" ON public.lesson_questions;
DROP POLICY IF EXISTS "Public view or Admin pure access" ON public.lesson_questions;
DROP POLICY IF EXISTS "Anyone enrolled can view questions" ON public.lesson_questions;

-- Grant ALL access to both Authenticated and Anonymous users (for development/pure access mode)
CREATE POLICY "Universal Q&A Access" 
ON public.lesson_questions FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- Ensure profiles are also visible to anon if we are doing joins
DROP POLICY IF EXISTS "Admin God Policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Universal Profile Access" 
ON public.profiles FOR SELECT 
TO authenticated, anon 
USING (true);

-- Also need to ensure courses/modules/lessons are visible to anon for the breadcrumbs
DROP POLICY IF EXISTS "Admin God Policy" ON public.courses;
CREATE POLICY "Universal Course Access" ON public.courses FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Admin God Policy" ON public.modules;
CREATE POLICY "Universal Module Access" ON public.modules FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Admin God Policy" ON public.lessons;
CREATE POLICY "Universal Lesson Access" ON public.lessons FOR SELECT TO authenticated, anon USING (true);

COMMENT ON TABLE public.lesson_questions IS 'Access opened to anon and authenticated for "Pure Access" mode.';
