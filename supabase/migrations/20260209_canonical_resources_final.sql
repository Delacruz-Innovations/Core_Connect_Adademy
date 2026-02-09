-- 🧠 CANONICAL REPAIR: RESOURCES MANAGEMENT SYSTEM
-- Objective: Establish the 'resources' table and migrate any data from 'documents' if it exists.

-- 1. Create Enums if they don't exist
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

-- 2. Create the Table
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

-- 3. Migration Logic: If 'documents' table exists, move data over to 'resources'
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
        INSERT INTO public.resources (id, title, description, resource_type, parent_type, parent_id, file_path, visibility_status, created_by, created_at, updated_at)
        SELECT 
            id, title, description, 
            document_type::text::public.resource_category, 
            parent_type::text::public.resource_parent_node, 
            parent_id, 
            storage_path, 
            visibility_status::text::public.resource_visibility, 
            created_by, created_at, updated_at
        FROM public.documents
        ON CONFLICT (id) DO NOTHING;
        
        -- Optional: DROP TABLE public.documents; -- Keep it for safety, but disable it
    END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 5. Access Policies
DROP POLICY IF EXISTS "Admins have full access to resources" ON public.resources;
CREATE POLICY "Admins have full access to resources"
ON public.resources FOR ALL TO authenticated
USING (public.check_is_admin())
WITH CHECK (public.check_is_admin());

DROP POLICY IF EXISTS "Students can view permitted resources" ON public.resources;
CREATE POLICY "Students can view permitted resources"
ON public.resources FOR SELECT TO authenticated
USING (
    visibility_status = 'published'
    AND (
        -- 1. Course Level Resources: Must be enrolled in the course
        (parent_type = 'course' AND EXISTS (
            SELECT 1 FROM public.enrollments 
            WHERE course_id = parent_id AND student_id = auth.uid() AND status = 'active'
        ))
        OR
        -- 2. Module Level Resources: Enrolled + Module Unlocked/Completed
        (parent_type = 'module' AND EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.modules m ON m.course_id = e.course_id
            LEFT JOIN public.module_progress mp ON mp.module_id = m.id AND mp.user_id = auth.uid()
            WHERE m.id = parent_id 
            AND e.student_id = auth.uid()
            AND (m.week_number = 1 OR mp.status IN ('unlocked', 'completed'))
        ))
        OR
        -- 3. Lesson Level Resources: Enrolled + Module Unlocked/Completed
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

-- 6. Storage Bucket Migration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lms-resources', 'lms-resources', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
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

-- 7. Audit Logging
CREATE OR REPLACE FUNCTION public.log_resource_action_v2()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
        auth.uid(),
        'admin',
        CASE 
            WHEN (TG_OP = 'INSERT') THEN 'resource_uploaded'
            WHEN (TG_OP = 'DELETE') THEN 'resource_deleted'
            ELSE 'resource_updated'
        END,
        'resource',
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END,
        jsonb_build_object(
            'title', CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END,
            'file_path', CASE WHEN TG_OP = 'DELETE' THEN OLD.file_path ELSE NEW.file_path END
        )
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_resources ON public.resources;
CREATE TRIGGER tr_audit_resources
AFTER INSERT OR UPDATE OR DELETE ON public.resources
FOR EACH ROW EXECUTE FUNCTION public.log_resource_action_v2();
