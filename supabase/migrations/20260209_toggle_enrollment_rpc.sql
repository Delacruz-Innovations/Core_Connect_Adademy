-- Migration: User Enrollment RPC
-- Description: Provides a server-side function to toggle student enrollments, bypassing RLS issues in the UI.

CREATE OR REPLACE FUNCTION public.toggle_enrollment(
    target_student_id uuid,
    target_course_id uuid,
    enrol_action text -- 'enrol' or 'unenrol'
)
RETURNS void AS $$
BEGIN
    -- Authorization check: Ensure requester is an admin
    IF NOT public.check_is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Administrative authority required.';
    END IF;

    IF enrol_action = 'enrol' THEN
        INSERT INTO public.enrollments (student_id, course_id, status)
        VALUES (target_student_id, target_course_id, 'active')
        ON CONFLICT (student_id, course_id) DO UPDATE SET status = 'active';
        
        -- Audit
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'manual_enrolment', 'profile', target_student_id::text, jsonb_build_object('course_id', target_course_id));
        
    ELSIF enrol_action = 'unenrol' THEN
        DELETE FROM public.enrollments
        WHERE student_id = target_student_id AND course_id = target_course_id;
        
        -- Audit
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (auth.uid(), 'admin', 'manual_unenrolment', 'profile', target_student_id::text, jsonb_build_object('course_id', target_course_id));
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
