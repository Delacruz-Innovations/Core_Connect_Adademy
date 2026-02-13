-- 1. Create Lesson Feedback Table
CREATE TABLE IF NOT EXISTS public.lesson_feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
    student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment text,
    is_anonymous boolean DEFAULT false,
    UNIQUE(lesson_id, student_id)
);

-- 2. Audit Logging for Feedback
CREATE OR REPLACE FUNCTION public.fn_audit_lesson_feedback_events()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
        auth.uid(),
        CASE WHEN public.check_is_admin() THEN 'admin' ELSE 'student' END,
        CASE WHEN (TG_OP = 'INSERT') THEN 'feedback_submitted' ELSE 'feedback_updated' END,
        'lesson_feedback',
        NEW.id::text,
        jsonb_build_object('lesson_id', NEW.lesson_id, 'rating', NEW.rating)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_audit_lesson_feedback AFTER INSERT OR UPDATE ON public.lesson_feedback FOR EACH ROW EXECUTE FUNCTION public.fn_audit_lesson_feedback_events();

-- 3. RLS Policies
ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage their own feedback" ON public.lesson_feedback;
CREATE POLICY "Students can manage their own feedback"
ON public.lesson_feedback FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all feedback" ON public.lesson_feedback;
CREATE POLICY "Admins can view all feedback"
ON public.lesson_feedback FOR SELECT
TO authenticated
USING (public.check_is_admin());
