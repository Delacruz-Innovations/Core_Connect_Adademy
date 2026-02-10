-- 🛠️ REPAIR: Fix Missing get_actor_role & Q&A Identity Reset
-- Objective: Fix the audit log breakage and implement "id-less" admin responses for Q&A.

-- 1. Restore the Missing Helper Function
CREATE OR REPLACE FUNCTION public.get_actor_role(u_id uuid)
RETURNS text AS $$
DECLARE
    v_role text;
BEGIN
    SELECT role::text INTO v_role FROM public.profiles WHERE id = u_id LIMIT 1;
    RETURN COALESCE(v_role, 'registered_user');
EXCEPTION WHEN OTHERS THEN
    RETURN 'registered_user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. "Id-less" Admin Q&A Branding
-- We relax the responded_by constraint further and ensure the audit logs just say 'admin'
ALTER TABLE public.lesson_questions ALTER COLUMN responded_by DROP NOT NULL;

-- 3. Update Q&A Audit Trigger to be more resilient
CREATE OR REPLACE FUNCTION public.fn_audit_lesson_question_events()
RETURNS TRIGGER AS $$
DECLARE
    v_event text;
    v_role text;
BEGIN
    -- Determine role safely
    IF public.check_is_admin() THEN 
        v_role := 'admin';
    ELSE
        v_role := 'student';
    END IF;

    IF (TG_OP = 'INSERT') THEN
        v_event := 'question_posted';
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.admin_response IS NULL AND NEW.admin_response IS NOT NULL THEN
            v_event := 'question_answered';
        ELSE
            v_event := 'question_updated';
        END IF;
    END IF;

    IF v_event IS NOT NULL THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (
            auth.uid(),
            v_role,
            v_event,
            'lesson_question',
            NEW.id::text,
            jsonb_build_object('lesson_id', NEW.lesson_id, 'student_id', NEW.student_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Clean up profiling trigger to match the new helper
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
            public.get_actor_role(auth.uid()),
            'profile_updated',
            'profile',
            NEW.id::text,
            v_changes
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_actor_role(uuid) IS 'Retrieves the canonical role for auditing. Repaired 2026-02-10.';
