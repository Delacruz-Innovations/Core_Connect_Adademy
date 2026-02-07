-- Migration: Course Audit Logging & Strict Security
-- Objective: Automatically log all course changes and enforce loose-coupling.

-- 1. Create Course Audit Trigger Function
CREATE OR REPLACE FUNCTION public.fn_log_course_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id uuid;
BEGIN
    -- Attempt to get the user ID who performed the action
    -- In Supabase, auth.uid() is available in RLS and Triggers
    v_admin_id := auth.uid();

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (
            event_type, 
            entity_type, 
            entity_id, 
            admin_id, 
            details
        ) VALUES (
            'course_created', 
            'course', 
            NEW.id, 
            v_admin_id,
            jsonb_build_object('title', NEW.title, 'slug', NEW.slug)
        );
        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        -- Detect Status Change
        IF (OLD.is_published IS DISTINCT FROM NEW.is_published) THEN
             INSERT INTO public.audit_logs (
                event_type, 
                entity_type, 
                entity_id, 
                admin_id, 
                details
            ) VALUES (
                CASE WHEN NEW.is_published THEN 'course_published' ELSE 'course_unpublished' END,
                'course', 
                NEW.id, 
                v_admin_id,
                jsonb_build_object('new_status', NEW.is_published)
            );
        Else 
            -- General Update
            INSERT INTO public.audit_logs (
                event_type, 
                entity_type, 
                entity_id, 
                admin_id, 
                details
            ) VALUES (
                'course_updated', 
                'course', 
                NEW.id, 
                v_admin_id,
                jsonb_build_object('changes', 'metadata_updated')
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach Trigger to Courses Table
DROP TRIGGER IF EXISTS tr_audit_courses ON public.courses;
CREATE TRIGGER tr_audit_courses
AFTER INSERT OR UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.fn_log_course_changes();

-- 3. Strict RLS Review (Double Check)
-- Ensure 'anon' can NEVER write
DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
CREATE POLICY "Public can view published courses" 
ON public.courses FOR SELECT 
TO anon, authenticated
USING (is_published = true);

-- Ensure only Admins can Write
-- (Assuming 'admin' role check is consistent with your profile table)
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses" 
ON public.courses 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
