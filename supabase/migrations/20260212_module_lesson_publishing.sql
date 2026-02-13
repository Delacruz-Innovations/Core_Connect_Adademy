-- 🚀 HIERARCHICAL PUBLISHING & TIERED THUMBNAILS
-- Add core columns to modules and lessons
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS thumbnail_url text;

ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- 1. Function: Validate Publishing Readiness
-- Ensures children are published before parent can go live
CREATE OR REPLACE FUNCTION public.fn_validate_publishing_readiness()
RETURNS TRIGGER AS $$
DECLARE
    v_draft_lessons int;
    v_draft_modules int;
BEGIN
    -- [MODULE VALIDATION]
    IF TG_TABLE_NAME = 'modules' AND NEW.is_published = true THEN
        -- Check if all child lessons are published
        SELECT COUNT(*) INTO v_draft_lessons 
        FROM public.lessons 
        WHERE module_id = NEW.id AND is_published = false;

        IF v_draft_lessons > 0 THEN
            RAISE EXCEPTION 'PROTOCOL VIOLATION: Cannot publish module with % draft lesson(s).', v_draft_lessons;
        END IF;
    END IF;

    -- [COURSE VALIDATION]
    IF TG_TABLE_NAME = 'courses' AND NEW.is_published = true THEN
        -- Check if all child modules are published
        SELECT COUNT(*) INTO v_draft_modules 
        FROM public.modules 
        WHERE course_id = NEW.id AND is_published = false;

        IF v_draft_modules > 0 THEN
            RAISE EXCEPTION 'PROTOCOL VIOLATION: Cannot publish course with % draft module(s).', v_draft_modules;
        END IF;
    END IF;

    -- [LESSON VALIDATION]
    IF TG_TABLE_NAME = 'lessons' AND NEW.is_published = true THEN
        -- Check Mux status for video lessons
        IF NEW.content_type = 'video' AND (NEW.mux_playback_id IS NULL OR NEW.mux_playback_id = '') THEN
            RAISE EXCEPTION 'PROTOCOL VIOLATION: Video lesson must have a valid Mux Playback ID to be published.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-assign triggers for readiness
DROP TRIGGER IF EXISTS tr_validate_module_publish ON public.modules;
CREATE TRIGGER tr_validate_module_publish BEFORE UPDATE OF is_published ON public.modules FOR EACH ROW EXECUTE FUNCTION public.fn_validate_publishing_readiness();

DROP TRIGGER IF EXISTS tr_validate_course_publish ON public.courses;
CREATE TRIGGER tr_validate_course_publish BEFORE UPDATE OF is_published ON public.courses FOR EACH ROW EXECUTE FUNCTION public.fn_validate_publishing_readiness();

DROP TRIGGER IF EXISTS tr_validate_lesson_publish ON public.lessons;
CREATE TRIGGER tr_validate_lesson_publish BEFORE UPDATE OF is_published ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.fn_validate_publishing_readiness();


-- 2. Function: Maintain Publishing Integrity (Reverse Cascade)
-- If a child goes to draft, parent MUST go to draft
CREATE OR REPLACE FUNCTION public.fn_maintain_publishing_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- If lesson goes draft -> unpublish parent module
    IF TG_TABLE_NAME = 'lessons' AND NEW.is_published = false AND OLD.is_published = true THEN
        UPDATE public.modules SET is_published = false WHERE id = NEW.module_id;
    END IF;

    -- If module goes draft -> unpublish parent course
    IF TG_TABLE_NAME = 'modules' AND NEW.is_published = false AND OLD.is_published = true THEN
        UPDATE public.courses SET is_published = false WHERE id = NEW.course_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-assign triggers for integrity
DROP TRIGGER IF EXISTS tr_integrity_lesson ON public.lessons;
CREATE TRIGGER tr_integrity_lesson AFTER UPDATE OF is_published ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.fn_maintain_publishing_integrity();

DROP TRIGGER IF EXISTS tr_integrity_module ON public.modules;
CREATE TRIGGER tr_integrity_module AFTER UPDATE OF is_published ON public.modules FOR EACH ROW EXECUTE FUNCTION public.fn_maintain_publishing_integrity();


-- 3. Update RLS Policies for Students
-- Only show published content to non-admins
DROP POLICY IF EXISTS "Public view published modules" ON public.modules;
CREATE POLICY "Public view published modules" ON public.modules FOR SELECT TO authenticated, anon USING (is_published = true OR public.check_is_admin());

DROP POLICY IF EXISTS "Public view published lessons" ON public.lessons;
CREATE POLICY "Public view published lessons" ON public.lessons FOR SELECT TO authenticated, anon USING (is_published = true OR public.check_is_admin());

-- Update existing course policy if needed
DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
CREATE POLICY "Public can view published courses" ON public.courses FOR SELECT TO authenticated, anon USING (is_published = true OR public.check_is_admin());
