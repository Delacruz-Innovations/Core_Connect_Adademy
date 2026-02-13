-- 🚑 Restoration RPC: Course Visibility Recovery
-- This function allows admins to publish all content by bypassing validation 
-- triggers. Useful for legacy data or sudden visibility losses.

CREATE OR REPLACE FUNCTION public.fn_rescue_course_visibility()
RETURNS void AS $$
BEGIN
    -- Check if user is admin
    IF public.check_is_admin() THEN
        -- Disable validation triggers temporarily
        ALTER TABLE public.lessons DISABLE TRIGGER tr_validate_lesson_publish;
        ALTER TABLE public.modules DISABLE TRIGGER tr_validate_module_publish;
        ALTER TABLE public.courses DISABLE TRIGGER tr_validate_course_publish;

        -- 1. Publish all lessons
        UPDATE public.lessons SET is_published = true;

        -- 2. Publish all modules
        UPDATE public.modules SET is_published = true;

        -- 3. Publish all courses
        UPDATE public.courses SET is_published = true;

        -- Re-enable validation triggers
        ALTER TABLE public.lessons ENABLE TRIGGER tr_validate_lesson_publish;
        ALTER TABLE public.modules ENABLE TRIGGER tr_validate_module_publish;
        ALTER TABLE public.courses ENABLE TRIGGER tr_validate_course_publish;
    ELSE
        RAISE EXCEPTION 'UNAUTHORIZED: Only authority nodes can initiate Protocol Rescue.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
