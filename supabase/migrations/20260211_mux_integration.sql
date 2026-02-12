-- 📽️ MUX INTEGRATION & HARD COMPLETION ENFORCEMENT
-- 1. Add Mux metadata to lessons
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS mux_playback_id text,
ADD COLUMN IF NOT EXISTS mux_asset_id text;

-- 2. Update completion requirement function to be even stricter
-- Ensure'is_completed' is true only when percent_watched >= 90
CREATE OR REPLACE FUNCTION public.check_module_completion_requirements(p_user_id uuid, p_module_id uuid)
RETURNS boolean AS $$
DECLARE
    v_lessons_count int;
    v_completed_lessons_count int;
    v_assignment_valid boolean;
BEGIN
    -- 1. Check lessons (Must be 90% watched)
    SELECT COUNT(*) INTO v_lessons_count FROM public.lessons WHERE module_id = p_module_id;
    
    SELECT COUNT(*) INTO v_completed_lessons_count 
    FROM public.lesson_progress 
    WHERE module_id = p_module_id 
    AND user_id = p_user_id 
    AND is_completed = true 
    AND percent_watched >= 90; -- Explicit double-check
    
    IF v_completed_lessons_count < v_lessons_count THEN
        RETURN false;
    END IF;

    -- 2. Check assignments (Must be submitted and NOT blocked)
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

-- 3. Update existing progress check function for course completion
-- This already includes final artefact logic from previous ritual implementation
-- but we ensure it uses the hardened module check.
CREATE OR REPLACE FUNCTION public.check_course_completion(p_user_id uuid, p_course_id uuid)
RETURNS boolean AS $$
DECLARE
    v_total_modules int;
    v_completed_modules int;
    v_has_final_artefact boolean;
    v_final_artefact_accepted boolean;
BEGIN
    -- Count total modules
    SELECT COUNT(*) INTO v_total_modules FROM public.modules WHERE course_id = p_course_id;

    -- Count modules that meet the HARDENED requirements (90% watch + assignment)
    SELECT COUNT(*) INTO v_completed_modules
    FROM public.modules m
    WHERE m.course_id = p_course_id
    AND public.check_module_completion_requirements(p_user_id, m.id) = true;

    IF v_completed_modules < v_total_modules THEN
        RETURN false;
    END IF;

    -- Check Final Artefact Requirement
    SELECT EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.modules m ON a.module_id = m.id
        WHERE m.course_id = p_course_id AND a.is_final_artefact = true
    ) INTO v_has_final_artefact;

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
