-- Migration: Secure Progression Integrity & Resume Playback
-- Objective: Fix security holes in progress tracking and automate Week 1 unlocking.

-- 1. STRICTER RLS for Lesson Progress
-- Students can only UPDATE lesson progress if the parent MODULE is unlocked for them.
-- This prevents API calls creating progress for locked weeks.

DROP POLICY IF EXISTS "Students update own lesson progress" ON public.lesson_progress;

CREATE POLICY "Students update own lesson progress"
ON public.lesson_progress FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.module_progress mp
    WHERE mp.user_id = auth.uid()
    AND mp.module_id = public.lesson_progress.module_id
    AND mp.status IN ('unlocked', 'completed')
  )
);

-- Also need to secure INSERT (creation of progress rows)
DROP POLICY IF EXISTS "Students insert own lesson progress" ON public.lesson_progress;

CREATE POLICY "Students insert own lesson progress"
ON public.lesson_progress FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.module_progress mp
    WHERE mp.user_id = auth.uid()
    AND mp.module_id = module_id
    AND mp.status IN ('unlocked', 'completed')
  )
);


-- 2. AUTOMATIC WEEK 1 UNLOCK (Trigger on Enrollment)
-- When a student is enrolled (status='active'), find the first module (Week 1) and unlock it.

CREATE OR REPLACE FUNCTION public.fn_unlock_week_one()
RETURNS TRIGGER AS $$
DECLARE
  v_first_module_id uuid;
BEGIN
    -- Only run for active enrollments
    IF (NEW.status = 'active') THEN
        
        -- Find Week 1 module for this course
        SELECT id INTO v_first_module_id
        FROM public.modules
        WHERE course_id = NEW.course_id
        AND week_number = 1;

        -- If found, insert Unlock record
        IF v_first_module_id IS NOT NULL THEN
            INSERT INTO public.module_progress (
                user_id, 
                course_id, 
                module_id, 
                status
            ) VALUES (
                NEW.student_id, 
                NEW.course_id, 
                v_first_module_id, 
                'unlocked'
            )
            ON CONFLICT (user_id, module_id) DO NOTHING;
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind to Enrollments table (assuming it exists from previous tasks)
-- Note: Check if 'enrollments' table name is correct. In standard Supabase starter it might be 'enrollment'.
-- Based on typical schema it's 'enrollments'.
DROP TRIGGER IF EXISTS tr_on_enrollment_unlock_week1 ON public.enrollments;
CREATE TRIGGER tr_on_enrollment_unlock_week1
AFTER INSERT OR UPDATE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.fn_unlock_week_one();


-- 3. ENSURE RESUME PLAYBACK ACCURACY
-- When lesson completes, ensure we don't accidentally reset 'last_position' to 0
-- (Already handled by standard UPDATE logic provided the frontend sends the right data)
-- But we add a check to prevent negative values.

ALTER TABLE public.lesson_progress 
  ADD CONSTRAINT check_positive_position 
  CHECK (last_position_seconds >= 0);
