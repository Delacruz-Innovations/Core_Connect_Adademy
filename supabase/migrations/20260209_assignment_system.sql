-- 1. Redefine Assignments Table with PRD strictness
CREATE TABLE IF NOT EXISTS public.assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE,
    title text NOT NULL,
    brief text NOT NULL, -- Renamed from description to match PRD
    allowed_file_types text[] DEFAULT '{pdf,doc,docx}', -- PRD: PDF or DOC only
    submission_required boolean DEFAULT true, -- PRD: Mandatory progression gate
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    UNIQUE(module_id)
);

-- 2. Redefine Assignment Submissions Table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    file_path text NOT NULL, -- Path in 'assignment-submissions' bucket
    reviewed_status text DEFAULT 'pending' CHECK (reviewed_status IN ('pending', 'reviewed')), -- PRD: pending/reviewed
    
    UNIQUE(user_id, assignment_id)
);

-- 3. Audit Logging Extension for Assignments
CREATE OR REPLACE FUNCTION public.fn_audit_assignment_events()
RETURNS TRIGGER AS $$
DECLARE
    v_event text;
    v_module_id uuid;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF TG_TABLE_NAME = 'assignments' THEN v_event := 'assignment_created'; v_module_id := NEW.module_id;
        ELSIF TG_TABLE_NAME = 'assignment_submissions' THEN v_event := 'assignment_submitted'; SELECT module_id INTO v_module_id FROM public.assignments WHERE id = NEW.assignment_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF TG_TABLE_NAME = 'assignments' THEN v_event := 'assignment_updated'; v_module_id := NEW.module_id;
        ELSIF TG_TABLE_NAME = 'assignment_submissions' THEN 
            IF OLD.file_path IS DISTINCT FROM NEW.file_path THEN v_event := 'assignment_replaced';
            ELSIF OLD.reviewed_status IS DISTINCT FROM NEW.reviewed_status AND NEW.reviewed_status = 'reviewed' THEN v_event := 'assignment_reviewed';
            END IF;
            SELECT module_id INTO v_module_id FROM public.assignments WHERE id = NEW.assignment_id;
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
            jsonb_build_object('module_id', v_module_id, 'assignment_id', CASE WHEN TG_TABLE_NAME = 'assignments' THEN NEW.id ELSE NEW.assignment_id END)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-assign triggers
DROP TRIGGER IF EXISTS tr_audit_assignments ON public.assignments;
CREATE TRIGGER tr_audit_assignments AFTER INSERT OR UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.fn_audit_assignment_events();

DROP TRIGGER IF EXISTS tr_audit_submissions ON public.assignment_submissions;
CREATE TRIGGER tr_audit_submissions AFTER INSERT OR UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.fn_audit_assignment_events();


-- 3. STORAGE: Assignment Submissions Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assignment-submissions', 'assignment-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS for Assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone enrolled can view assignments" ON public.assignments;
CREATE POLICY "Anyone enrolled can view assignments"
ON public.assignments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.enrollments e ON e.course_id = m.course_id
        WHERE m.id = assignments.module_id
        AND e.student_id = auth.uid()
        AND e.status = 'active'
    )
    OR public.check_is_admin()
);

DROP POLICY IF EXISTS "Admins manage assignments" ON public.assignments;
CREATE POLICY "Admins manage assignments"
ON public.assignments FOR ALL
TO authenticated
USING (public.check_is_admin());

-- 5. RLS for Submissions
DROP POLICY IF EXISTS "Students manage own submissions" ON public.assignment_submissions;
CREATE POLICY "Students manage own submissions"
ON public.assignment_submissions FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all submissions" ON public.assignment_submissions;
CREATE POLICY "Admins view all submissions"
ON public.assignment_submissions FOR SELECT
TO authenticated
USING (public.check_is_admin());

DROP POLICY IF EXISTS "Admins grade submissions" ON public.assignment_submissions;
CREATE POLICY "Admins grade submissions"
ON public.assignment_submissions FOR UPDATE
TO authenticated
USING (public.check_is_admin());

-- 6. Storage RLS
DROP POLICY IF EXISTS "Students upload own submissions to storage" ON storage.objects;
CREATE POLICY "Students upload own submissions to storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'assignment-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Admins view all submission files" ON storage.objects;
CREATE POLICY "Admins view all submission files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'assignment-submissions'
    AND public.check_is_admin()
);

DROP POLICY IF EXISTS "Users view own submission files" ON storage.objects;
CREATE POLICY "Users view own submission files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'assignment-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. UPDATE SEQUENTIAL LOGIC: Gated by Assignment
-- We modify `fn_unlock_next_module` to ensure it only unlocks if requirements are met.
-- Wait, the current logic triggers on `module_progress` status = 'completed'.
-- So the frontend OR an RPC must handle the 'completed' transition while checking assignments.

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
        WHERE module_id = p_module_id AND submission_required = true
    ) INTO v_has_assignment;

    -- 2. Check if student submission exists
    IF v_has_assignment THEN
        SELECT EXISTS (
            SELECT 1 FROM public.assignment_submissions sub
            JOIN public.assignments a ON a.id = sub.assignment_id
            WHERE a.module_id = p_module_id
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

-- 8. RPC: Safe Module Completion
CREATE OR REPLACE FUNCTION public.complete_module(p_module_id uuid)
RETURNS void AS $$
DECLARE
    v_course_id uuid;
BEGIN
    IF NOT public.can_complete_module(auth.uid(), p_module_id) THEN
        RAISE EXCEPTION 'PRD VIOLATION: Assignment or Lessons incomplete for Module %', p_module_id;
    END IF;

    SELECT course_id INTO v_course_id FROM public.modules WHERE id = p_module_id;

    INSERT INTO public.module_progress (user_id, course_id, module_id, status, completed_at)
    VALUES (auth.uid(), v_course_id, p_module_id, 'completed', now())
    ON CONFLICT (user_id, module_id) 
    DO UPDATE SET status = 'completed', completed_at = now();

    -- Trigger tr_on_module_complete will handle unlocking the next module.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
