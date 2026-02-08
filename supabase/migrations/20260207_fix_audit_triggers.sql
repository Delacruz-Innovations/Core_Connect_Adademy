-- Migration: Fix Audit Triggers for Canonical Schema
-- Objective: Update all database triggers to write to the standardized audit_logs columns.
-- Rationale: The audit_logs table was renamed in 20260207_canonical_admin_auth.sql, breaking old triggers.

-- 1. Helper Function to get Actor Role
CREATE OR REPLACE FUNCTION public.get_actor_role(u_id uuid)
RETURNS text AS $$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = u_id LIMIT 1);
EXCEPTION WHEN OTHERS THEN
    RETURN 'unknown';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FIX: Courses Audit Trigger
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
            VALUES (auth.uid(), 'admin', 'course_updated', 'course', NEW.id::text, jsonb_build_object('changes', 'metadata'));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FIX: Modules Audit Trigger
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

-- 4. FIX: Lessons Audit Trigger
CREATE OR REPLACE FUNCTION public.fn_audit_lesson_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'lesson_created', 'lesson', NEW.id::text, jsonb_build_object('title', NEW.title, 'module_id', NEW.module_id));
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.video_path IS DISTINCT FROM NEW.video_path) THEN
             INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
             VALUES (auth.uid(), 'admin', 'video_uploaded', 'lesson', NEW.id::text, jsonb_build_object('path', NEW.video_path));
        ELSE
             INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
             VALUES (auth.uid(), 'admin', 'lesson_updated', 'lesson', NEW.id::text, jsonb_build_object('title', NEW.title));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FIX: Application Approval Trigger
CREATE OR REPLACE FUNCTION public.fn_on_application_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved')) THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (NEW.admin_id, 'admin', 'application_approved', 'application', NEW.id::text, jsonb_build_object('email', NEW.email, 'program', NEW.program_name));
        NEW.approved_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_actor_role(uuid) IS 'Retrieves the canonical role for auditing.';
