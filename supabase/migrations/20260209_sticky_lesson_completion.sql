-- 📝 STICKY LESSON COMPLETION SYSTEM
-- Ensure that once a student completes a lesson, it stays completed regardless of re-watches.

CREATE OR REPLACE FUNCTION public.fn_enforce_lesson_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_was_completed boolean;
BEGIN
    -- 1. Identify existing completion state
    -- If TG_OP is 'UPDATE', OLD is available.
    -- If TG_OP is 'INSERT', there is no 'OLD' state.
    IF (TG_OP = 'UPDATE') THEN
        v_was_completed := COALESCE(OLD.is_completed, false);
    ELSE
        v_was_completed := false;
    END IF;

    -- 2. Calculate percentage accurately
    IF NEW.total_duration > 0 THEN
        NEW.percent_watched := LEAST(100, (NEW.watched_seconds * 100) / NEW.total_duration);
    END IF;

    -- 3. Enforce Sticky Completion
    -- Condition A: Lesson reaches 90% threshold for the first time
    IF NEW.percent_watched >= 90 AND NOT v_was_completed THEN
        NEW.is_completed := true;
        NEW.completed_at := now();
    
    -- Condition B: Lesson was ALREADY completed (Stickiness Logic)
    -- We ignore the current percentage if it's already marked as done.
    ELSIF v_was_completed THEN
        NEW.is_completed := true;
        NEW.completed_at := OLD.completed_at; -- Preserve original completion timestamp
    
    -- Condition C: Lesson is not yet reached threshold and wasn't completed
    ELSE
        NEW.is_completed := false;
        NEW.completed_at := NULL;
    END IF;

    -- 4. Audit Admin Overrides (Optional refinement)
    -- If we really NEEDED to allow admins to unmark, we'd add check_is_admin() logic here.
    -- But per user request: "it should not be unmarked".

    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger to handle both INSERTS and UPDATES
DROP TRIGGER IF EXISTS tr_lesson_progress_enforcement ON public.lesson_progress;
CREATE TRIGGER tr_lesson_progress_enforcement
BEFORE INSERT OR UPDATE ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_lesson_completion();
