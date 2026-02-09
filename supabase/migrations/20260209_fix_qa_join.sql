-- Fix Lesson Q&A Student Reference for PostgREST joins
ALTER TABLE public.lesson_questions 
DROP CONSTRAINT IF EXISTS lesson_questions_student_id_fkey;

ALTER TABLE public.lesson_questions
ADD CONSTRAINT lesson_questions_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure PostgREST reloads its cache
NOTIFY pgrst, 'reload schema';
