-- 1. Modify Assignments Table to be polymorphic
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS parent_type text DEFAULT 'module' CHECK (parent_type IN ('module', 'lesson'));

-- Drop the old unique constraint on module_id if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assignments_module_id_key') THEN
        ALTER TABLE public.assignments DROP CONSTRAINT assignments_module_id_key;
    END IF;
END $$;

-- Add a more flexible unique constraint
ALTER TABLE public.assignments ADD CONSTRAINT assignments_parent_unique UNIQUE (parent_type, module_id, lesson_id);

-- 2. Enrich Assignment Submissions with Grading
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS grade_score int;
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS admin_feedback text;
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS graded_at timestamptz;
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS graded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Update Audit Logging Function
CREATE OR REPLACE FUNCTION public.fn_audit_assignment_events_v2()
RETURNS TRIGGER AS $$
DECLARE
    v_event text;
    v_module_id uuid;
    v_lesson_id uuid;
    v_metadata jsonb;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF TG_TABLE_NAME = 'assignments' THEN 
            v_event := 'assignment_created'; 
            v_module_id := NEW.module_id;
            v_lesson_id := NEW.lesson_id;
        ELSIF TG_TABLE_NAME = 'assignment_submissions' THEN 
            v_event := 'assignment_submitted'; 
            SELECT module_id, lesson_id INTO v_module_id, v_lesson_id FROM public.assignments WHERE id = NEW.assignment_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF TG_TABLE_NAME = 'assignments' THEN 
            v_event := 'assignment_updated'; 
            v_module_id := NEW.module_id;
            v_lesson_id := NEW.lesson_id;
        ELSIF TG_TABLE_NAME = 'assignment_submissions' THEN 
            IF OLD.file_path IS DISTINCT FROM NEW.file_path THEN 
                v_event := 'assignment_replaced';
            ELSIF OLD.grade_score IS DISTINCT FROM NEW.grade_score OR OLD.admin_feedback IS DISTINCT FROM NEW.admin_feedback THEN 
                v_event := 'assignment_graded';
            ELSIF OLD.reviewed_status IS DISTINCT FROM NEW.reviewed_status AND NEW.reviewed_status = 'reviewed' THEN 
                v_event := 'assignment_reviewed';
            END IF;
            SELECT module_id, lesson_id INTO v_module_id, v_lesson_id FROM public.assignments WHERE id = NEW.assignment_id;
        END IF;
    END IF;

    IF v_event IS NOT NULL THEN
        v_metadata := jsonb_build_object(
            'module_id', v_module_id, 
            'lesson_id', v_lesson_id,
            'assignment_id', CASE WHEN TG_TABLE_NAME = 'assignments' THEN NEW.id ELSE NEW.assignment_id END
        );
        
        IF v_event = 'assignment_graded' THEN
            v_metadata := v_metadata || jsonb_build_object('grade', NEW.grade_score, 'feedback', LEFT(NEW.admin_feedback, 100));
        END IF;

        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (
            auth.uid(),
            CASE WHEN public.check_is_admin() THEN 'admin' ELSE 'student' END,
            v_event,
            CASE WHEN TG_TABLE_NAME = 'assignments' THEN 'assignment' ELSE 'submission' END,
            NEW.id::text,
            v_metadata
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-link triggers to V2
DROP TRIGGER IF EXISTS tr_audit_assignments ON public.assignments;
CREATE TRIGGER tr_audit_assignments AFTER INSERT OR UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.fn_audit_assignment_events_v2();

DROP TRIGGER IF EXISTS tr_audit_submissions ON public.assignment_submissions;
CREATE TRIGGER tr_audit_submissions AFTER INSERT OR UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.fn_audit_assignment_events_v2();

-- 4. Update can_complete_module to handle optionality better
CREATE OR REPLACE FUNCTION public.can_complete_module(
    p_user_id uuid,
    p_module_id uuid
)
RETURNS boolean AS $$
DECLARE
    v_has_assignment boolean;
    v_submitted boolean;
    v_lessons_total int;
    v_lessons_completed int;
BEGIN
    -- 1. Check if module has a submission_required assignment
    SELECT EXISTS (
        SELECT 1 FROM public.assignments 
        WHERE module_id = p_module_id AND parent_type = 'module' AND submission_required = true
    ) INTO v_has_assignment;

    -- 2. Check if student submission exists
    IF v_has_assignment THEN
        SELECT EXISTS (
            SELECT 1 FROM public.assignment_submissions sub
            JOIN public.assignments a ON a.id = sub.assignment_id
            WHERE a.module_id = p_module_id AND a.parent_type = 'module'
            AND sub.user_id = p_user_id
        ) INTO v_submitted;
        
        IF NOT v_submitted THEN
            RETURN false;
        END IF;
    END IF;

    -- 3. Check if all lessons are reached ≥90% watch (is_completed flag)
    SELECT COUNT(*) INTO v_lessons_total FROM public.lessons WHERE module_id = p_module_id;
    SELECT COUNT(*) INTO v_lessons_completed FROM public.lesson_progress 
    WHERE module_id = p_module_id AND user_id = p_user_id AND is_completed = true;

    IF v_lessons_completed < v_lessons_total THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
