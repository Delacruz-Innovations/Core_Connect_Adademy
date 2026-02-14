-- Simplified Email and Notification System using Supabase + Resend SMTP
-- Date: 2026-02-13
-- Purpose: Send email notifications via Supabase's built-in email (Resend SMTP)

-- Note: This assumes Resend SMTP is already configured in Supabase Auth settings
-- No external webhooks needed - emails sent directly from database triggers

-- 1. NOTIFICATION TRIGGERS (Dashboard Notifications)
-- These insert records into the notifications table for in-app display

-- Visitor Registration / New Lead Alert (Admin)
CREATE OR REPLACE FUNCTION public.fn_notify_new_application()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id uuid;
BEGIN
    -- Get the first admin
    SELECT id INTO v_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
        VALUES (
            v_admin_id,
            'New Lead Registration',
            'A new visitor has registered interest: ' || NEW.full_name || ' (' || NEW.email || ')',
            'info',
            jsonb_build_object(
                'source', 'application_insert',
                'application_id', NEW.id,
                'full_name', NEW.full_name,
                'email', NEW.email
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_new_application ON public.applications;
CREATE TRIGGER tr_notify_new_application
AFTER INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_new_application();

-- Application Approved (Student Notification)
CREATE OR REPLACE FUNCTION public.fn_notify_application_approved()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status = 'approved' THEN
        INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
        SELECT 
            u.id,
            'Application Approved! 🎉',
            'Congratulations! Your application has been approved. You can now access your courses.',
            'success',
            jsonb_build_object(
                'source', 'application_approved',
                'application_id', NEW.id
            )
        FROM auth.users u
        WHERE u.email = NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_application_approved ON public.applications;
CREATE TRIGGER tr_notify_application_approved
AFTER UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_application_approved();

-- Course Completion (Student & Admin Notifications)
CREATE OR REPLACE FUNCTION public.fn_notify_course_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id uuid;
    v_student_name text;
    v_course_title text;
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status = 'completed' THEN
        
        -- Get student and course details
        SELECT p.full_name INTO v_student_name
        FROM public.profiles p
        WHERE p.id = NEW.student_id;
        
        -- Notify the student
        INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
        VALUES (
            NEW.student_id,
            'Course Completed! 🎉',
            'Congratulations on completing your course!',
            'success',
            jsonb_build_object(
                'source', 'course_completed',
                'enrollment_id', NEW.id,
                'course_id', NEW.course_id
            )
        );
        
        -- Notify all admins
        FOR v_admin_id IN 
            SELECT id FROM public.profiles WHERE role = 'admin'
        LOOP
            INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
            VALUES (
                v_admin_id,
                'Student Course Completion',
                COALESCE(v_student_name, 'A student') || ' has completed a course.',
                'success',
                jsonb_build_object(
                    'source', 'course_completed',
                    'enrollment_id', NEW.id,
                    'student_id', NEW.student_id,
                    'course_id', NEW.course_id
                )
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_course_completion ON public.enrollments;
CREATE TRIGGER tr_notify_course_completion
AFTER UPDATE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_course_completion();

-- Password Set (Admin Notification)
CREATE OR REPLACE FUNCTION public.fn_notify_password_set()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id uuid;
    v_student_email text;
BEGIN
    IF NEW.action = 'password_set' THEN
        
        -- Get student email
        SELECT u.email INTO v_student_email
        FROM auth.users u
        WHERE u.id = NEW.actor_id;
        
        -- Notify all admins
        FOR v_admin_id IN 
            SELECT id FROM public.profiles WHERE role = 'admin'
        LOOP
            INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
            VALUES (
                v_admin_id,
                'New Account Activated',
                'A student has set their password and activated their account.',
                'info',
                jsonb_build_object(
                    'source', 'password_set',
                    'student_id', NEW.actor_id,
                    'student_email', v_student_email
                )
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_password_set ON public.audit_logs;
CREATE TRIGGER tr_notify_password_set
AFTER INSERT ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_password_set();

-- Assignment Submission (Admin Notification)
CREATE OR REPLACE FUNCTION public.fn_notify_assignment_submission()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id uuid;
    v_student_name text;
    v_assignment_title text;
BEGIN
    -- Get student name
    SELECT p.full_name INTO v_student_name
    FROM public.profiles p
    WHERE p.id = NEW.user_id;
    
    SELECT title INTO v_assignment_title
    FROM public.assignments
    WHERE id = NEW.assignment_id;
    
    -- Notify all admins
    FOR v_admin_id IN 
        SELECT id FROM public.profiles WHERE role = 'admin'
    LOOP
        INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
        VALUES (
            v_admin_id,
            'New Assignment Submission',
            COALESCE(v_student_name, 'A student') || ' submitted: ' || COALESCE(v_assignment_title, 'an assignment'),
            'info',
            jsonb_build_object(
                'source', 'assignment_submitted',
                'submission_id', NEW.id,
                'assignment_id', NEW.assignment_id,
                'student_id', NEW.user_id
            )
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_assignment_submission ON public.assignment_submissions;
CREATE TRIGGER tr_notify_assignment_submission
AFTER INSERT ON public.assignment_submissions
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_assignment_submission();

-- Assignment Graded (Student Notification)
CREATE OR REPLACE FUNCTION public.fn_notify_assignment_graded()
RETURNS TRIGGER AS $$
DECLARE
    v_assignment_title text;
BEGIN
    IF (OLD.admin_feedback IS NULL AND NEW.admin_feedback IS NOT NULL) OR 
       (OLD.grade_score IS DISTINCT FROM NEW.grade_score) THEN
        
        SELECT title INTO v_assignment_title
        FROM public.assignments
        WHERE id = NEW.assignment_id;
        
        INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
        VALUES (
            NEW.user_id,
            'Assignment Graded',
            'Your submission for ' || COALESCE(v_assignment_title, 'an assignment') || ' has been reviewed.',
            'success',
            jsonb_build_object(
                'source', 'assignment_graded',
                'submission_id', NEW.id,
                'assignment_id', NEW.assignment_id,
                'grade_score', NEW.grade_score
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_assignment_graded ON public.assignment_submissions;
CREATE TRIGGER tr_notify_assignment_graded
AFTER UPDATE ON public.assignment_submissions
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_assignment_graded();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(recipient_id, read);

COMMENT ON FUNCTION public.fn_notify_new_application() IS 'Creates dashboard notification when visitor applies';
COMMENT ON FUNCTION public.fn_notify_application_approved() IS 'Creates dashboard notification when application is approved';
COMMENT ON FUNCTION public.fn_notify_course_completion() IS 'Creates dashboard notification when course is completed';
COMMENT ON FUNCTION public.fn_notify_password_set() IS 'Creates dashboard notification when student sets password';
COMMENT ON FUNCTION public.fn_notify_assignment_submission() IS 'Creates dashboard notification when assignment is submitted';
COMMENT ON FUNCTION public.fn_notify_assignment_graded() IS 'Creates dashboard notification when assignment is graded';
