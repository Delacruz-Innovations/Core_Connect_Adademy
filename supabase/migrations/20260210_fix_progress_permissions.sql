-- 🧠 REPAIR: PROGRESS SYSTEM PERMISSIONS (Idempotent)
-- Objective: Ensure students can read and update their own progress records, only for existing tables.

DO $$ 
BEGIN
    -- 1. Course Progress Permissions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_progress') THEN
        GRANT SELECT, INSERT, UPDATE ON TABLE public.course_progress TO authenticated;
        ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Students view own course progress" ON public.course_progress;
        CREATE POLICY "Students view own course progress" ON public.course_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
        
        DROP POLICY IF EXISTS "Admins manage all progress" ON public.course_progress;
        CREATE POLICY "Admins manage all progress" ON public.course_progress FOR ALL TO authenticated USING (public.check_is_admin());
    END IF;

    -- 2. Module Progress Permissions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'module_progress') THEN
        GRANT SELECT, INSERT, UPDATE ON TABLE public.module_progress TO authenticated;
        ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Students view own module progress" ON public.module_progress;
        CREATE POLICY "Students view own module progress" ON public.module_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
        
        DROP POLICY IF EXISTS "Students update own module progress" ON public.module_progress;
        CREATE POLICY "Students update own module progress" ON public.module_progress FOR UPDATE TO authenticated USING (user_id = auth.uid());
        
        DROP POLICY IF EXISTS "Admins manage all module progress" ON public.module_progress;
        CREATE POLICY "Admins manage all module progress" ON public.module_progress FOR ALL TO authenticated USING (public.check_is_admin());
    END IF;

    -- 3. Lesson Progress Permissions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lesson_progress') THEN
        GRANT SELECT, INSERT, UPDATE ON TABLE public.lesson_progress TO authenticated;
        ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Students view own lesson progress" ON public.lesson_progress;
        CREATE POLICY "Students view own lesson progress" ON public.lesson_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
        
        DROP POLICY IF EXISTS "Students update own lesson progress" ON public.lesson_progress;
        CREATE POLICY "Students update own lesson progress" ON public.lesson_progress FOR ALL TO authenticated USING (user_id = auth.uid());
        
        DROP POLICY IF EXISTS "Admins manage all lesson progress" ON public.lesson_progress;
        CREATE POLICY "Admins manage all lesson progress" ON public.lesson_progress FOR ALL TO authenticated USING (public.check_is_admin());
    END IF;

END $$;

-- 4. Force Schema Reload
NOTIFY pgrst, 'reload schema';