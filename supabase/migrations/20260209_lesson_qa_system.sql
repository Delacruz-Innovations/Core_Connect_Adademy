-- 1. Create Lesson Q&A Table
CREATE TABLE IF NOT EXISTS public.lesson_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
    student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_resolved boolean DEFAULT false,
    admin_response text,
    responded_at timestamptz,
    responded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 2. Audit Logging for Q&A
CREATE OR REPLACE FUNCTION public.fn_audit_lesson_question_events()
RETURNS TRIGGER AS $$
DECLARE
    v_event text;
    v_metadata jsonb;
BEGIN
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
            CASE WHEN public.check_is_admin() THEN 'admin' ELSE 'student' END,
            v_event,
            'lesson_question',
            NEW.id::text,
            jsonb_build_object('lesson_id', NEW.lesson_id, 'student_id', NEW.student_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_audit_lesson_questions AFTER INSERT OR UPDATE ON public.lesson_questions FOR EACH ROW EXECUTE FUNCTION public.fn_audit_lesson_question_events();

-- 3. RLS Policies
ALTER TABLE public.lesson_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone enrolled can view questions" ON public.lesson_questions;
CREATE POLICY "Anyone enrolled can view questions"
ON public.lesson_questions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.modules m ON m.id = l.module_id
        JOIN public.enrollments e ON e.course_id = m.course_id
        WHERE l.id = lesson_questions.lesson_id
        AND e.student_id = auth.uid()
        AND e.status = 'active'
    )
    OR public.check_is_admin()
);

DROP POLICY IF EXISTS "Students can post questions" ON public.lesson_questions;
CREATE POLICY "Students can post questions"
ON public.lesson_questions FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can answer questions" ON public.lesson_questions;
CREATE POLICY "Admins can answer questions"
ON public.lesson_questions FOR UPDATE
TO authenticated
USING (public.check_is_admin());
