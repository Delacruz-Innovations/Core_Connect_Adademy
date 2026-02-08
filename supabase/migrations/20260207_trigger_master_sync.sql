-- Migration: Master Audit Sync & Trigger Repair
-- Objective: Finalize the "Frozen v1" schema by repairing all triggers that still reference 'event_type'.

-- 1. Ensure Column Standardizing
DO $$ BEGIN
    -- If event_type exists, rename it to action
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='event_type') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN event_type TO action;
    END IF;
    -- If details exists, rename it to metadata
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='details') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN details TO metadata;
    END IF;
    -- If user_id exists, rename to target_user_id (to avoid actor_id confusion)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='user_id') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN user_id TO target_user_id;
    END IF;
    -- If admin_id exists, rename to actor_id (if actor_id doesn't exist yet)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='admin_id') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='actor_id') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN admin_id TO actor_id;
    END IF;
EXCEPTION WHEN others THEN null; END $$;

-- 2. Repair 'courses' Trigger
CREATE OR REPLACE FUNCTION public.fn_log_course_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'course_created', 'course', NEW.id::text, jsonb_build_object('title', NEW.title));
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.is_published IS DISTINCT FROM NEW.is_published) THEN
            INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
            VALUES (auth.uid(), 'admin', CASE WHEN NEW.is_published THEN 'course_published' ELSE 'course_unpublished' END, 'course', NEW.id::text, jsonb_build_object('published', NEW.is_published));
        ELSE
            INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
            VALUES (auth.uid(), 'admin', 'course_updated', 'course', NEW.id::text, jsonb_build_object('title', NEW.title));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Repair 'modules' Trigger
CREATE OR REPLACE FUNCTION public.fn_audit_module_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'module_created', 'module', NEW.id::text, jsonb_build_object('title', NEW.title, 'course_id', NEW.course_id));
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'module_updated', 'module', NEW.id::text, jsonb_build_object('title', NEW.title));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Repair 'lessons' Trigger
CREATE OR REPLACE FUNCTION public.fn_audit_lesson_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'lesson_created', 'lesson', NEW.id::text, jsonb_build_object('title', NEW.title));
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'lesson_updated', 'lesson', NEW.id::text, jsonb_build_object('title', NEW.title));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Repair 'applications' Status Changes
CREATE OR REPLACE FUNCTION public.fn_on_application_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved')) THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'application_approved', 'application', NEW.id::text, jsonb_build_object('program', NEW.program_name));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach/Refresh Triggers
DROP TRIGGER IF EXISTS tr_audit_courses ON public.courses;
CREATE TRIGGER tr_audit_courses AFTER INSERT OR UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.fn_log_course_changes();

DROP TRIGGER IF EXISTS tr_audit_modules ON public.modules;
CREATE TRIGGER tr_audit_modules AFTER INSERT OR UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.fn_audit_module_changes();

DROP TRIGGER IF EXISTS tr_audit_lessons ON public.lessons;
CREATE TRIGGER tr_audit_lessons AFTER INSERT OR UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.fn_audit_lesson_changes();

DROP TRIGGER IF EXISTS tr_on_approval_logic ON public.applications;
CREATE TRIGGER tr_on_approval_logic AFTER UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.fn_on_application_approval();
