-- 🧠 REPAIR: AUTOMATIC PROGRESS INITIALIZATION & ACCESS FIX
-- Objective: Ensure students can access Week 1 lessons immediately upon enrollment.
-- Rationale: The previous RLS policy for 'lessons' was too strict, requiring a progress record that didn't always exist.

-- 1. Progress Initialization Function
CREATE OR REPLACE FUNCTION public.fn_init_student_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_first_module_id uuid;
BEGIN
    -- Only run for active enrollments
    IF NEW.status = 'active' THEN
        -- Find the first module (Week 1) for this course
        SELECT id INTO v_first_module_id
        FROM public.modules
        WHERE course_id = NEW.course_id
        ORDER BY week_number ASC
        LIMIT 1;

        -- If a module exists, create the 'unlocked' progress record
        IF v_first_module_id IS NOT NULL THEN
            INSERT INTO public.module_progress (user_id, course_id, module_id, status)
            VALUES (NEW.student_id, NEW.course_id, v_first_module_id, 'unlocked')
            ON CONFLICT (user_id, module_id) DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger on Enrollments
DROP TRIGGER IF EXISTS tr_init_progress_on_enrollment ON public.enrollments;
CREATE TRIGGER tr_init_progress_on_enrollment
AFTER INSERT ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.fn_init_student_progress();

-- 3. Backfill Existing Active Enrollments
DO $$ 
DECLARE
    r RECORD;
    v_mod_id uuid;
BEGIN
    FOR r IN SELECT student_id, course_id FROM public.enrollments WHERE status = 'active' LOOP
        SELECT id INTO v_mod_id FROM public.modules WHERE course_id = r.course_id ORDER BY week_number ASC LIMIT 1;
        IF v_mod_id IS NOT NULL THEN
            INSERT INTO public.module_progress (user_id, course_id, module_id, status)
            VALUES (r.student_id, r.course_id, v_mod_id, 'unlocked')
            ON CONFLICT (user_id, module_id) DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- 4. Relax Lessons RLS Policy
-- Allow students to see lessons if they have progress OR if it's the first module of an active enrollment.
DROP POLICY IF EXISTS "Students view lessons of unlocked modules" ON public.lessons;
CREATE POLICY "Students view lessons of unlocked modules"
ON public.lessons FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.module_progress mp
        WHERE mp.module_id = public.lessons.module_id
        AND mp.user_id = auth.uid()
        AND mp.status IN ('unlocked', 'completed')
    )
    OR EXISTS (
        -- Safety: Allow viewing week 1 lessons if enrolled, even if progress record is missing
        SELECT 1 FROM public.modules m
        JOIN public.enrollments e ON e.course_id = m.course_id
        WHERE m.id = public.lessons.module_id
        AND m.week_number = 1
        AND e.student_id = auth.uid()
        AND e.status = 'active'
    )
    OR public.check_is_admin()
);

-- 5. Force Schema Reload
NOTIFY pgrst, 'reload schema';
