-- Migration: Fix Audit Logs Schema & Triggers
-- Objective: Ensure entity_id is TEXT (Canonical Standard) and fix trigger type mismatches.
-- Rationale: entity_id must be TEXT to support various entity types. Old schemas had it as UUID.

-- 1. Correct the Schema (Convert UUID to TEXT)
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' 
        AND column_name = 'entity_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.audit_logs ALTER COLUMN entity_id TYPE text;
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

-- 5. Refresh Triggers
DROP TRIGGER IF EXISTS tr_audit_courses ON public.courses;
CREATE TRIGGER tr_audit_courses AFTER INSERT OR UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.fn_log_course_changes();

DROP TRIGGER IF EXISTS tr_audit_modules ON public.modules;
CREATE TRIGGER tr_audit_modules AFTER INSERT OR UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.fn_audit_module_changes();

DROP TRIGGER IF EXISTS tr_audit_lessons ON public.lessons;
CREATE TRIGGER tr_audit_lessons AFTER INSERT OR UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.fn_audit_lesson_changes();
