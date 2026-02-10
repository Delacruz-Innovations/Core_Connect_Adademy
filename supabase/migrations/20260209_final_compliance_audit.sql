-- 🧠 FINAL AUDIT & GATING REFINEMENT (v2)
-- Objective: Universalize audit logging and enforce strict assignment gating for progression.

-- 1. Standardized Profiling Audit
CREATE OR REPLACE FUNCTION public.fn_log_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_changes jsonb;
BEGIN
    v_changes := '{}'::jsonb;
    IF OLD.role IS DISTINCT FROM NEW.role THEN v_changes := v_changes || jsonb_build_object('role', NEW.role); END IF;
    IF OLD.full_name IS DISTINCT FROM NEW.full_name THEN v_changes := v_changes || jsonb_build_object('full_name', NEW.full_name); END IF;
    
    IF v_changes != '{}'::jsonb THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (
            auth.uid(),
            COALESCE(public.get_actor_role(auth.uid()), 'registered_user'),
            'profile_updated',
            'profile',
            NEW.id::text,
            v_changes
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_log_profile_action ON public.profiles;
CREATE TRIGGER tr_audit_profiles
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_log_profile_changes();

-- 2. Enrollments Audit
CREATE OR REPLACE FUNCTION public.fn_log_enrollment_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'enrollment_created', 'enrollment', NEW.id::text, jsonb_build_object('student_id', NEW.student_id, 'course_id', NEW.course_id));
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
            VALUES (auth.uid(), 'admin', 'enrollment_status_changed', 'enrollment', NEW.id::text, jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_enrollments ON public.enrollments;
CREATE TRIGGER tr_audit_enrollments
AFTER INSERT OR UPDATE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.fn_log_enrollment_changes();

-- 3. Resources Audit
CREATE OR REPLACE FUNCTION public.fn_log_resource_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'resource_created', 'resource', NEW.id::text, jsonb_build_object('title', NEW.title, 'parent_id', NEW.parent_id));
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'resource_deleted', 'resource', OLD.id::text, jsonb_build_object('title', OLD.title));
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_resources ON public.resources;
CREATE TRIGGER tr_audit_resources
AFTER INSERT OR DELETE ON public.resources
FOR EACH ROW EXECUTE FUNCTION public.fn_log_resource_changes();

-- 4. Strict Gating Implementation (Lessons and Modules)
CREATE OR REPLACE FUNCTION public.fn_enforce_lesson_completion_v2()
RETURNS TRIGGER AS $$
DECLARE
    v_assignment_required boolean;
    v_assignment_submitted boolean;
BEGIN
    -- 1. Calculate percentage accurately
    IF NEW.total_duration > 0 THEN
        NEW.percent_watched := LEAST(100, (NEW.watched_seconds * 100) / NEW.total_duration);
    END IF;

    -- 2. Check for required lesson assignment
    SELECT EXISTS (
        SELECT 1 FROM public.assignments 
        WHERE lesson_id = NEW.lesson_id AND parent_type = 'lesson' AND submission_required = true
    ) INTO v_assignment_required;

    IF v_assignment_required THEN
        SELECT EXISTS (
            SELECT 1 FROM public.assignment_submissions sub
            JOIN public.assignments a ON a.id = sub.assignment_id
            WHERE a.lesson_id = NEW.lesson_id AND a.parent_type = 'lesson'
            AND sub.user_id = NEW.user_id
        ) INTO v_assignment_submitted;
    ELSE
        v_assignment_submitted := true;
    END IF;

    -- 3. Enforce completion (Watch + Assignment)
    IF NEW.percent_watched >= 90 AND v_assignment_submitted AND NOT OLD.is_completed THEN
        NEW.is_completed := true;
        NEW.completed_at := now();
    ELSIF (NEW.percent_watched < 90 OR NOT v_assignment_submitted) AND NOT public.check_is_admin() THEN
        NEW.is_completed := false;
        NEW.completed_at := NULL;
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_lesson_progress_enforcement ON public.lesson_progress;
CREATE TRIGGER tr_lesson_progress_enforcement
BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_lesson_completion_v2();

-- 5. Auto-recheck Lesson Progress on Assignment Submission
CREATE OR REPLACE FUNCTION public.fn_recheck_lesson_on_submission()
RETURNS TRIGGER AS $$
DECLARE
    v_lesson_id uuid;
    v_user_id uuid;
BEGIN
    -- Only for lesson assignments
    SELECT lesson_id INTO v_lesson_id FROM public.assignments WHERE id = NEW.assignment_id AND parent_type = 'lesson';
    v_user_id := NEW.user_id;

    IF v_lesson_id IS NOT NULL THEN
        -- Trigger an update on lesson_progress to hit the enforcement logic
        UPDATE public.lesson_progress 
        SET updated_at = now() 
        WHERE lesson_id = v_lesson_id AND user_id = v_user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_recheck_lesson_on_submission ON public.assignment_submissions;
CREATE TRIGGER tr_recheck_lesson_on_submission
AFTER INSERT ON public.assignment_submissions
FOR EACH ROW EXECUTE FUNCTION public.fn_recheck_lesson_on_submission();

-- 6. Canonical can_complete_module (V3 - Includes Lesson Assignments)
CREATE OR REPLACE FUNCTION public.can_complete_module_v2(
    p_user_id uuid,
    p_module_id uuid
)
RETURNS boolean AS $$
DECLARE
    v_has_mod_assignment boolean;
    v_mod_submitted boolean;
    v_lessons_total int;
    v_lessons_completed int;
BEGIN
    -- 1. Check Module-level Assignment
    SELECT EXISTS (
        SELECT 1 FROM public.assignments 
        WHERE module_id = p_module_id AND parent_type = 'module' AND submission_required = true
    ) INTO v_has_mod_assignment;

    IF v_has_mod_assignment THEN
        SELECT EXISTS (
            SELECT 1 FROM public.assignment_submissions sub
            JOIN public.assignments a ON a.id = sub.assignment_id
            WHERE a.module_id = p_module_id AND a.parent_type = 'module'
            AND sub.user_id = p_user_id
        ) INTO v_mod_submitted;
        
        IF NOT v_mod_submitted THEN
            RETURN false;
        END IF;
    END IF;

    -- 2. Check all lessons (Wait, the lesson is_completed already checks for its own assignment)
    SELECT COUNT(*) INTO v_lessons_total FROM public.lessons WHERE module_id = p_module_id;
    SELECT COUNT(*) INTO v_lessons_completed FROM public.lesson_progress 
    WHERE module_id = p_module_id AND user_id = p_user_id AND is_completed = true;

    IF v_lessons_completed < v_lessons_total THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
