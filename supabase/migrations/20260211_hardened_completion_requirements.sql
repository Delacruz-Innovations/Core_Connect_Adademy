-- 🛡️ HARDENED MODULE COMPLETION REQUIREMENTS
-- Module completion now requires all lessons to be 90% watched AND all module assignments to be submitted and NOT blocked.

CREATE OR REPLACE FUNCTION public.check_module_completion_requirements(p_user_id uuid, p_module_id uuid)
RETURNS boolean AS $$
DECLARE
    v_lessons_count int;
    v_completed_lessons_count int;
    v_assignment_required boolean;
    v_assignment_valid boolean;
BEGIN
    -- 1. Check lessons (Already 90% watched via lesson_progress trigger)
    SELECT COUNT(*) INTO v_lessons_count FROM public.lessons WHERE module_id = p_module_id;
    SELECT COUNT(*) INTO v_completed_lessons_count FROM public.lesson_progress 
    WHERE module_id = p_module_id AND user_id = p_user_id AND is_completed = true;
    
    IF v_completed_lessons_count < v_lessons_count THEN
        RETURN false;
    END IF;

    -- 2. Check assignments
    -- We assume existence of an assignment linked to the module.
    -- v_assignment_valid is true if ALL assignments for this module are submitted and NOT blocked.
    SELECT NOT EXISTS (
        SELECT 1 FROM public.assignments a
        LEFT JOIN public.assignment_submissions sub ON a.id = sub.assignment_id AND sub.user_id = p_user_id
        WHERE a.module_id = p_module_id 
        AND (
            sub.id IS NULL -- Not submitted
            OR sub.reviewed_status = 'blocked' -- Submitted but needs work
        )
    ) INTO v_assignment_valid;

    IF NOT v_assignment_valid THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-trigger module/course checks for existing students might be needed, 
-- but triggers will fire on next activity.
