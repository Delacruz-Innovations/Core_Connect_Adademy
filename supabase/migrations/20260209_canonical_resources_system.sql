-- 🧠 MASTER MIGRATION: CANONICAL RESOURCES MANAGEMENT SYSTEM
-- (PART OF PRD-CANONICAL ENFORCEMENT)

-- 1. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_category') THEN
        CREATE TYPE public.resource_category AS ENUM ('reference', 'instruction', 'assignment_support', 'policy');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_parent_node') THEN
        CREATE TYPE public.resource_parent_node AS ENUM ('course', 'module', 'lesson');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_visibility') THEN
        CREATE TYPE public.resource_visibility AS ENUM ('draft', 'published');
    END IF;
END $$;

-- 2. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    resource_type public.resource_category NOT NULL,
    parent_type public.resource_parent_node NOT NULL,
    parent_id uuid NOT NULL,
    file_path text NOT NULL UNIQUE,
    visibility_status public.resource_visibility DEFAULT 'draft' NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_resources_parent ON public.resources (parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_resources_visibility ON public.resources (visibility_status);

-- 4. RLS ENFORCEMENT
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- ADMIN: FULL CRUD
DROP POLICY IF EXISTS "Admins have full access to resources" ON public.resources;
CREATE POLICY "Admins have full access to resources"
ON public.resources FOR ALL TO authenticated
USING (public.check_is_admin())
WITH CHECK (public.check_is_admin());

-- STUDENT: SEQUENTIAL ACCESS ONLY
-- Rule: Visible ONLY if the parent content is unlocked for the student.
DROP POLICY IF EXISTS "Students can view permitted resources" ON public.resources;
CREATE POLICY "Students can view permitted resources"
ON public.resources FOR SELECT TO authenticated
USING (
    visibility_status = 'published'
    AND (
        -- Course Level: Enrolled students
        (parent_type = 'course' AND EXISTS (
            SELECT 1 FROM public.enrollments 
            WHERE course_id = parent_id AND student_id = auth.uid() AND status = 'active'
        ))
        OR
        -- Module Level: Enrolled + Module Unlocked
        (parent_type = 'module' AND EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.modules m ON m.course_id = e.course_id
            LEFT JOIN public.module_progress mp ON mp.module_id = m.id AND mp.user_id = auth.uid()
            WHERE m.id = parent_id 
            AND e.student_id = auth.uid()
            AND (m.week_number = 1 OR mp.status IN ('unlocked', 'completed'))
        ))
        OR
        -- Lesson Level: Enrolled + Module Unlocked
        (parent_type = 'lesson' AND EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.modules m ON m.course_id = e.course_id
            JOIN public.lessons l ON l.module_id = m.id
            LEFT JOIN public.module_progress mp ON mp.module_id = m.id AND mp.user_id = auth.uid()
            WHERE l.id = parent_id 
            AND e.student_id = auth.uid()
            AND (m.week_number = 1 OR mp.status IN ('unlocked', 'completed'))
        ))
    )
);

-- 5. STORAGE BUCKET: lms-resources
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lms-resources', 'lms-resources', false)
ON CONFLICT (id) DO NOTHING;

-- STORAGE RLS
DROP POLICY IF EXISTS "Admins can manage resource files" ON storage.objects;
CREATE POLICY "Admins can manage resource files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'lms-resources' AND public.check_is_admin());

DROP POLICY IF EXISTS "Students can download permitted resources" ON storage.objects;
CREATE POLICY "Students can download permitted resources"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'lms-resources'
    AND EXISTS (
        SELECT 1 FROM public.resources
        WHERE file_path = name
        AND visibility_status = 'published'
    )
);

-- 6. AUDIT TRIGGER
CREATE OR REPLACE FUNCTION public.log_resource_action()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
        auth.uid(),
        CASE WHEN public.check_is_admin() THEN 'admin' ELSE 'student' END,
        CASE 
            WHEN (TG_OP = 'INSERT') THEN 'resource_uploaded'
            WHEN (TG_OP = 'DELETE') THEN 'resource_deleted'
            ELSE 'resource_updated'
        END,
        'resource',
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END,
        jsonb_build_object(
            'title', CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END,
            'parent_type', CASE WHEN TG_OP = 'DELETE' THEN OLD.parent_type ELSE NEW.parent_type END,
            'parent_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.parent_id ELSE NEW.parent_id END,
            'visibility', CASE WHEN TG_OP = 'DELETE' THEN 'deleted' ELSE NEW.visibility_status END
        )
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_resources ON public.resources;
CREATE TRIGGER tr_audit_resources
AFTER INSERT OR UPDATE OR DELETE ON public.resources
FOR EACH ROW EXECUTE FUNCTION public.log_resource_action();
