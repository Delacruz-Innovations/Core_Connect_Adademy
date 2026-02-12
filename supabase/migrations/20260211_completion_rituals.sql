-- 🎓 PHASE 2: FINAL COMPLETION RITUALS
-- Objective: Ensure graduation is triggered by a specific "Final Artefact Pack".

-- 1. Add final artefact marker to assignments
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS is_final_artefact boolean DEFAULT false;

-- 2. Update completion requirement function to check for final artefact
CREATE OR REPLACE FUNCTION public.check_course_completion(p_user_id uuid, p_course_id uuid)
RETURNS boolean AS $$
DECLARE
    v_total_modules int;
    v_completed_modules int;
    v_has_final_artefact boolean;
    v_final_artefact_accepted boolean;
BEGIN
    -- Count total modules in course
    SELECT COUNT(*) INTO v_total_modules 
    FROM public.modules 
    WHERE course_id = p_course_id;

    -- Count modules where all requirements (lessons + assignments) are met
    SELECT COUNT(*) INTO v_completed_modules
    FROM public.modules m
    WHERE m.course_id = p_course_id
    AND public.check_module_completion_requirements(p_user_id, m.id) = true;

    -- If not all modules are complete, course isn't complete
    IF v_completed_modules < v_total_modules THEN
        RETURN false;
    END IF;

    -- Check if course has a defined final artefact pack
    SELECT EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.modules m ON a.module_id = m.id
        WHERE m.course_id = p_course_id AND a.is_final_artefact = true
    ) INTO v_has_final_artefact;

    -- If it has one, it MUST be accepted for graduation
    IF v_has_final_artefact THEN
        SELECT EXISTS (
            SELECT 1 FROM public.assignment_submissions sub
            JOIN public.assignments a ON sub.assignment_id = a.id
            JOIN public.modules m ON a.module_id = m.id
            WHERE m.course_id = p_course_id 
            AND a.is_final_artefact = true 
            AND sub.user_id = p_user_id
            AND sub.reviewed_status = 'accepted'
        ) INTO v_final_artefact_accepted;

        IF NOT v_final_artefact_accepted THEN
            RETURN false;
        END IF;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update the graduation trigger logic (if needed)
-- Assuming we already have a progress trigger that calls public.update_course_progress_status()
-- which in turn uses check_course_completion().
