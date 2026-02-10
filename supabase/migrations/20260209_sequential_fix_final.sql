-- 🧠 COMPLETE SEQUENTIAL ENFORCEMENT & INITIALIZATION
-- Objective: Ensure Module 1 is unlocked on enrollment and lessons are gated sequentially.

-- 1. Progress Initialization Trigger
CREATE OR REPLACE FUNCTION public.fn_initialize_student_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_first_module_id uuid;
BEGIN
    -- 1. Get the first module of the course (week_number = 1)
    SELECT id INTO v_first_module_id
    FROM public.modules
    WHERE course_id = NEW.course_id
    ORDER BY week_number ASC
    LIMIT 1;

    -- 2. Create an 'unlocked' progress record for the first module
    IF v_first_module_id IS NOT NULL THEN
        INSERT INTO public.module_progress (user_id, course_id, module_id, status)
        VALUES (NEW.student_id, NEW.course_id, v_first_module_id, 'unlocked')
        ON CONFLICT (user_id, module_id) DO UPDATE SET status = 'unlocked' 
        WHERE module_progress.status = 'locked'; -- Only upgrade from locked
    END IF;

    -- 3. Initialize Course Progress
    INSERT INTO public.course_progress (user_id, course_id, status)
    VALUES (NEW.student_id, NEW.course_id, 'in_progress')
    ON CONFLICT (user_id, course_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_initialize_progress_on_enrollment ON public.enrollments;
CREATE TRIGGER tr_initialize_progress_on_enrollment
AFTER INSERT ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.fn_initialize_student_progress();

-- 2. Strict Lesson Sequential RLS
-- Students can only see lessons if the module is unlocked AND they completed the previous lesson (or it's the first).
DROP POLICY IF EXISTS "Students view lessons of unlocked modules" ON public.lessons;
CREATE POLICY "Students view sequential lessons"
ON public.lessons FOR SELECT
TO authenticated
USING (
    public.check_is_admin()
    OR (
        EXISTS (
            SELECT 1 FROM public.module_progress mp
            WHERE mp.module_id = public.lessons.module_id
            AND mp.user_id = auth.uid()
            AND mp.status IN ('unlocked', 'completed')
        )
        AND (
            public.lessons.order_index = 1 
            OR EXISTS (
                SELECT 1 FROM public.lessons prev
                JOIN public.lesson_progress lp ON lp.lesson_id = prev.id
                WHERE prev.module_id = public.lessons.module_id
                AND prev.order_index < public.lessons.order_index -- Any previous lesson must be completed? No, just the immediately preceding one.
                AND lp.user_id = auth.uid()
                AND lp.is_completed = true
                -- We only check if there is AT LEAST one completed lesson if order_index > 1? 
                -- Actually, the most robust check is: count of completed lessons in module = order_index - 1
                HAVING COUNT(*) >= (public.lessons.order_index - 1)
            )
        )
    )
);

-- Note: The above HAVING clause is tricky in RLS. Let's simplify:
-- A lesson is accessible if (order_index = 1) OR (the lesson with order_index - 1 is completed).
DROP POLICY IF EXISTS "Students view sequential lessons" ON public.lessons;
CREATE POLICY "Students view sequential lessons"
ON public.lessons FOR SELECT
TO authenticated
USING (
    public.check_is_admin()
    OR (
        EXISTS (
            SELECT 1 FROM public.module_progress mp
            WHERE mp.module_id = public.lessons.module_id
            AND mp.user_id = auth.uid()
            AND mp.status IN ('unlocked', 'completed')
        )
        AND (
            order_index = 1
            OR EXISTS (
                SELECT 1 FROM public.lessons prev
                JOIN public.lesson_progress lp ON lp.lesson_id = prev.id
                WHERE prev.module_id = public.lessons.module_id
                AND prev.order_index = (public.lessons.order_index - 1)
                AND lp.user_id = auth.uid()
                AND lp.is_completed = true
            )
        )
    )
);

-- 3. Fix Course Outcomes Reflection
-- Ensure students can view course outcomes and marketing data even if locked?
-- No, marketing data is in 'courses' table which usually has universal visibility for students.
-- But let's ensure 'learning_outcomes' etc. are readable.
GRANT SELECT ON public.courses TO authenticated;

-- 4. Audit Log fixes (Ensure all mutations are caught)
-- We already have triggers for progress, assignments, etc.

-- 5. Backfill for existing enrollments (Safety Protocol)
INSERT INTO public.module_progress (user_id, course_id, module_id, status)
SELECT e.student_id, e.course_id, m.id, 'unlocked'
FROM public.enrollments e
JOIN public.modules m ON m.course_id = e.course_id
WHERE m.week_number = 1
ON CONFLICT (user_id, module_id) DO NOTHING;

INSERT INTO public.course_progress (user_id, course_id, status)
SELECT student_id, course_id, 'in_progress'
FROM public.enrollments
ON CONFLICT (user_id, course_id) DO NOTHING;
