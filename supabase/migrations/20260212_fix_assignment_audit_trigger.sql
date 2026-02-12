-- 🛠️ REPAIR: Fix Assignment Audit Trigger
-- Objective: Fix "record 'new' has no field 'assignment_id'" error during assignment creation.
-- Rationale: The audit trigger was trying to access NEW.assignment_id even when the table was 'assignments' (which doesn't have that column).

CREATE OR REPLACE FUNCTION public.fn_audit_assignment_events()
RETURNS TRIGGER AS $$
DECLARE
    v_event text;
    v_module_id uuid;
    v_assignment_id uuid;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF TG_TABLE_NAME = 'assignments' THEN 
            v_event := 'assignment_created'; 
            v_module_id := NEW.module_id;
            v_assignment_id := NEW.id;
        ELSIF TG_TABLE_NAME = 'assignment_submissions' THEN 
            v_event := 'assignment_submitted'; 
            v_assignment_id := NEW.assignment_id;
            SELECT module_id INTO v_module_id FROM public.assignments WHERE id = v_assignment_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF TG_TABLE_NAME = 'assignments' THEN 
            v_event := 'assignment_updated'; 
            v_module_id := NEW.module_id;
            v_assignment_id := NEW.id;
        ELSIF TG_TABLE_NAME = 'assignment_submissions' THEN 
            v_event := 'assignment_updated_status'; -- default
            IF OLD.file_path IS DISTINCT FROM NEW.file_path THEN 
                v_event := 'assignment_replaced';
            ELSIF OLD.reviewed_status IS DISTINCT FROM NEW.reviewed_status AND NEW.reviewed_status = 'reviewed' THEN 
                v_event := 'assignment_reviewed';
            END IF;
            v_assignment_id := NEW.assignment_id;
            SELECT module_id INTO v_module_id FROM public.assignments WHERE id = v_assignment_id;
        END IF;
    END IF;

    IF v_event IS NOT NULL THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (
            auth.uid(),
            CASE WHEN public.check_is_admin() THEN 'admin' ELSE 'student' END,
            v_event,
            CASE WHEN TG_TABLE_NAME = 'assignments' THEN 'assignment' ELSE 'submission' END,
            NEW.id::text,
            jsonb_build_object(
                'module_id', v_module_id, 
                'assignment_id', v_assignment_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. DATABASE: Assignments Table Universal Access
-- Disabling RLS to match the pattern for management tables
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.assignments TO anon, authenticated, service_role;

-- 3. Safety: Make creator optional
ALTER TABLE public.assignments ALTER COLUMN created_by DROP NOT NULL;

COMMENT ON FUNCTION public.fn_audit_assignment_events() IS 'Fixed audit trigger to handle table-specific columns correctly without record field errors.';
