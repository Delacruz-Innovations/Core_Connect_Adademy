-- Email and Notification System: Database Webhooks Integration
-- Date: 2026-02-13
-- Purpose: Enable email notifications via Resend using Supabase Database Webhooks (no Edge Functions)

-- 1. ENABLE HTTP EXTENSION (pg_net for database webhooks)
-- This allows Supabase to make HTTP requests directly from database triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. NOTIFICATION RELAY FUNCTION
-- This function will be triggered after a notification is inserted, and it will
-- send a webhook to our Vercel function to trigger the Resend email
CREATE OR REPLACE FUNCTION public.fn_relay_notification_to_email()
RETURNS TRIGGER AS $$
DECLARE
    v_webhook_url text;
    v_payload jsonb;
    v_recipient_email text;
BEGIN
    -- Get the webhook URL from environment (you'll set this via Supabase dashboard)
    -- Format: https://your-admin-portal.vercel.app/api/webhooks/resend
    v_webhook_url := current_setting('app.webhook_url', true);
    
    -- Skip if no webhook URL is configured
    IF v_webhook_url IS NULL OR v_webhook_url = '' THEN
        RETURN NEW;
    END IF;
    
    -- Fetch recipient email from auth.users
    SELECT email INTO v_recipient_email 
    FROM auth.users 
    WHERE id = NEW.recipient_id;
    
    -- Build the webhook payload
    v_payload := jsonb_build_object(
        'event_type', 'notification_created',
        'notification_id', NEW.id,
        'recipient_id', NEW.recipient_id,
        'recipient_email', v_recipient_email,
        'title', NEW.title,
        'message', NEW.message,
        'type', NEW.type,
        'metadata', NEW.metadata,
        'created_at', NEW.created_at
    );
    
    -- Fire the webhook asynchronously using pg_net
    PERFORM net.http_post(
        url := v_webhook_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'X-Supabase-Signature', encode(hmac(v_payload::text, current_setting('app.webhook_secret', true), 'sha256'), 'hex')
        ),
        body := v_payload
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TRIGGER ON NOTIFICATIONS TABLE
DROP TRIGGER IF EXISTS tr_relay_notification_email ON public.notifications;
CREATE TRIGGER tr_relay_notification_email
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.fn_relay_notification_to_email();

-- 4. VISITOR ENROLLMENT NOTIFICATION (New Lead Alert for Admin)
CREATE OR REPLACE FUNCTION public.fn_notify_new_application()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id uuid;
BEGIN
    -- Get the first admin (you can make this more sophisticated if needed)
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
                'email', NEW.email,
                'template', 'admin-new-lead'
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

-- 5. APPLICATION APPROVED NOTIFICATION (Student)
CREATE OR REPLACE FUNCTION public.fn_notify_application_approved()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if status changed to 'approved'
    IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status = 'approved' THEN
        -- Find the student's user_id (assuming they have an auth record by email)
        INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
        SELECT 
            u.id,
            'Application Approved!',
            'Congratulations! Your application has been approved. You can now access your courses.',
            'success',
            jsonb_build_object(
                'source', 'application_approved',
                'application_id', NEW.id,
                'template', 'student-app-approved'
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

-- 6. COURSE COMPLETION NOTIFICATION (Student & Admin)
CREATE OR REPLACE FUNCTION public.fn_notify_course_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id uuid;
    v_student_name text;
    v_course_title text;
BEGIN
    -- Only trigger if status changed to 'completed'
    IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status = 'completed' THEN
        
        -- Get student and course details
        SELECT p.full_name, c.title INTO v_student_name, v_course_title
        FROM public.profiles p
        JOIN public.courses c ON c.id = NEW.course_id
        WHERE p.id = NEW.student_id;
        
        -- Notify the student
        INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
        VALUES (
            NEW.student_id,
            'Course Completed! 🎉',
            'Congratulations on completing ' || COALESCE(v_course_title, 'your course') || '!',
            'success',
            jsonb_build_object(
                'source', 'course_completed',
                'enrollment_id', NEW.id,
                'course_id', NEW.course_id,
                'template', 'student-course-completed'
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
                COALESCE(v_student_name, 'A student') || ' has completed ' || COALESCE(v_course_title, 'a course') || '.',
                'success',
                jsonb_build_object(
                    'source', 'course_completed',
                    'enrollment_id', NEW.id,
                    'student_id', NEW.student_id,
                    'course_id', NEW.course_id,
                    'template', 'admin-course-completed'
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

-- 7. PASSWORD SET NOTIFICATION (Admin)
CREATE OR REPLACE FUNCTION public.fn_notify_password_set()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id uuid;
    v_student_name text;
    v_student_email text;
BEGIN
    -- Only trigger if action is 'password_set'
    IF NEW.action = 'password_set' THEN
        
        -- Get student details
        SELECT p.full_name, u.email INTO v_student_name, v_student_email
        FROM public.profiles p
        JOIN auth.users u ON u.id = p.id
        WHERE p.id = NEW.actor_id;
        
        -- Notify all admins
        FOR v_admin_id IN 
            SELECT id FROM public.profiles WHERE role = 'admin'
        LOOP
            INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
            VALUES (
                v_admin_id,
                'New Account Activated',
                COALESCE(v_student_name, 'A student') || ' has set their password and activated their account.',
                'info',
                jsonb_build_object(
                    'source', 'password_set',
                    'student_id', NEW.actor_id,
                    'student_email', v_student_email,
                    'template', 'admin-password-set'
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

-- 8. ASSIGNMENT SUBMISSION NOTIFICATION (Admin)
CREATE OR REPLACE FUNCTION public.fn_notify_assignment_submission()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id uuid;
    v_student_name text;
    v_assignment_title text;
BEGIN
    -- Get student and assignment details
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
                'student_id', NEW.user_id,
                'template', 'admin-new-submission'
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

-- 9. ASSIGNMENT GRADED NOTIFICATION (Student)
CREATE OR REPLACE FUNCTION public.fn_notify_assignment_graded()
RETURNS TRIGGER AS $$
DECLARE
    v_assignment_title text;
BEGIN
    -- Only trigger if admin_feedback was just added or grade_score changed
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
                'grade_score', NEW.grade_score,
                'template', 'student-grade-posted'
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

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(recipient_id, read);

COMMENT ON FUNCTION public.fn_relay_notification_to_email() IS 'Relays notification insertions to Vercel webhook for Resend email delivery';
COMMENT ON TRIGGER tr_relay_notification_email ON public.notifications IS 'Automatically sends emails via Resend when notifications are created';
