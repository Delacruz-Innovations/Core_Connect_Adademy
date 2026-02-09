-- Fix Lesson Progress RLS to prevent 403 Forbidden errors
-- The previous strict policy required a module_progress record to exist, which caused issues for Week 1 or initial access.
-- We are relaxing this to rely on user ownership and existing content triggers for integrity.

-- 1. Drop old restrictive policies
DROP POLICY IF EXISTS "Students update own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Students insert own lesson progress" ON public.lesson_progress;

-- 2. Create more permissive policies (User ownership only)
-- We rely on fn_enforce_lesson_completion trigger to ensure valid watch data, 
-- and frontend logic to hide locked content.
CREATE POLICY "Students manage own lesson progress"
ON public.lesson_progress
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Ensure RLS is enabled
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
