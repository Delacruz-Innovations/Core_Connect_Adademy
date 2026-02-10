-- 🧠 Q&A Enhancements: Multi-level Queries & Global Notifications
-- Objective: Allow questions at Module/Course level and ensure students are notified of answers.

-- 1. Extend lesson_questions Table
ALTER TABLE public.lesson_questions 
ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_lesson_questions_module_id ON public.lesson_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_lesson_questions_course_id ON public.lesson_questions(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_questions_is_resolved ON public.lesson_questions(is_resolved);

-- 2. Notification Trigger for Admin Answers
CREATE OR REPLACE FUNCTION public.fn_notify_on_question_answer()
RETURNS TRIGGER AS $$
DECLARE
    v_context_title text;
BEGIN
    -- Only run if admin_response was just added
    IF (OLD.admin_response IS NULL AND NEW.admin_response IS NOT NULL) OR 
       (OLD.admin_response IS DISTINCT FROM NEW.admin_response) THEN
        
        -- Determine context for the notification message
        IF NEW.lesson_id IS NOT NULL THEN
            SELECT title INTO v_context_title FROM public.lessons WHERE id = NEW.lesson_id;
        ELSIF NEW.module_id IS NOT NULL THEN
            SELECT title INTO v_context_title FROM public.modules WHERE id = NEW.module_id;
        ELSIF NEW.course_id IS NOT NULL THEN
            SELECT title INTO v_context_title FROM public.courses WHERE id = NEW.course_id;
        END IF;

        INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
        VALUES (
            NEW.student_id,
            'New Answer to Your Question',
            'An instructor has responded to your query regarding: ' || COALESCE(v_context_title, 'the course material'),
            'success',
            jsonb_build_object(
                'source', 'qa_answer',
                'question_id', NEW.id,
                'lesson_id', NEW.lesson_id,
                'module_id', NEW.module_id,
                'course_id', NEW.course_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger
DROP TRIGGER IF EXISTS tr_notify_on_question_answer ON public.lesson_questions;
CREATE TRIGGER tr_notify_on_question_answer
AFTER UPDATE ON public.lesson_questions
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_on_question_answer();

-- 3. Relax RLS for Module/Course Level Questions
DROP POLICY IF EXISTS "Anyone enrolled can view questions" ON public.lesson_questions;
CREATE POLICY "Anyone enrolled can view questions"
ON public.lesson_questions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.student_id = auth.uid()
        AND e.course_id = COALESCE(
            lesson_questions.course_id, 
            (SELECT course_id FROM public.modules WHERE id = lesson_questions.module_id),
            (SELECT m.course_id FROM public.lessons l JOIN public.modules m ON m.id = l.module_id WHERE l.id = lesson_questions.lesson_id)
        )
        AND e.status = 'active'
    )
    OR public.check_is_admin()
);
