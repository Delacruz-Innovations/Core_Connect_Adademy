SELECT q.*, p.full_name as student_name 
FROM public.lesson_questions q
LEFT JOIN public.profiles p ON p.id = q.student_id;
