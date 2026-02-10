-- 🛠️ Fix Relationship for Q&A Join
-- PostgREST (Supabase API) needs a direct relationship to public.profiles to perform the join in QuestionManagement.jsx

-- 1. Update student_id to reference public.profiles instead of auth.users
-- Since profiles.id is already a reference to auth.users.id, this is safe and better for API joins.
ALTER TABLE public.lesson_questions 
DROP CONSTRAINT IF EXISTS lesson_questions_student_id_fkey;

ALTER TABLE public.lesson_questions 
ADD CONSTRAINT lesson_questions_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Ensure responded_by also has a clear relationship if needed
ALTER TABLE public.lesson_questions 
DROP CONSTRAINT IF EXISTS lesson_questions_responded_by_fkey;

ALTER TABLE public.lesson_questions 
ADD CONSTRAINT lesson_questions_responded_by_fkey 
FOREIGN KEY (responded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
