-- Migration: Multi-Course Approval System
-- Description: Updates the approve_application function and applications table to support multiple course assignments.

-- 1. Update applications table to support multiple courses
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS assigned_course_ids uuid[] DEFAULT ARRAY[]::uuid[];

-- 2. Update approve_application function to handle multiple courses
CREATE OR REPLACE FUNCTION public.approve_application(
    target_application_id uuid,
    final_course_ids uuid[] -- Changed from single uuid to array
)
RETURNS void AS $$
DECLARE
    app_record RECORD;
    target_user_id uuid;
    cid uuid;
BEGIN
    -- Check if actor is admin
    IF NOT public.check_is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Admin authorization required.';
    END IF;

    -- Get application
    SELECT * INTO app_record FROM public.applications WHERE id = target_application_id;
    IF app_record.id IS NULL THEN
        RAISE EXCEPTION 'Application not found.';
    END IF;

    -- Find user by email
    SELECT id INTO target_user_id FROM auth.users WHERE email = app_record.email;
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User profile not found for email %', app_record.email;
    END IF;
    
    -- Update Application Status
    UPDATE public.applications
    SET 
        status = 'approved',
        assigned_course_ids = final_course_ids,
        -- Keep assigned_course_id as the first course for backward compatibility or primary track
        assigned_course_id = final_course_ids[1],
        admin_id = auth.uid(),
        reviewed_at = now()
    WHERE id = target_application_id;

    -- Create/Update Enrollments for EACH course in the array
    IF final_course_ids IS NOT NULL AND array_length(final_course_ids, 1) > 0 THEN
        FOREACH cid IN ARRAY final_course_ids
        LOOP
            INSERT INTO public.enrollments (student_id, course_id, application_id, status)
            VALUES (target_user_id, cid, target_application_id, 'active')
            ON CONFLICT (student_id, course_id) DO UPDATE SET status = 'active';
        END LOOP;
    END IF;

    -- Activate Profile Role
    UPDATE public.profiles
    SET role = 'student'
    WHERE id = target_user_id;

    -- Audit
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
        auth.uid(), 
        'admin', 
        'enrollment_approved_multi', 
        'application', 
        target_application_id::text, 
        jsonb_build_object('course_ids', final_course_ids, 'student_id', target_user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
