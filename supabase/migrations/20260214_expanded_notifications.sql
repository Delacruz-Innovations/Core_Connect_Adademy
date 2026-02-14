-- Expanded Notification System (Unified Dispatcher + New Triggers)
-- Date: 2026-02-14
-- Objective: Handle Visitor Emails, Student Grading Alerts, and New Module Notifications.

-- 1. Prerequisites (Extensions & Config)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.system_config (
    key text PRIMARY KEY,
    value text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ensure API Key is present (User provided: re_W7NTeqaV_J8Lg8zR4zvpZtRn64A5YKrLJ)
INSERT INTO public.system_config (key, value, description)
VALUES ('RESEND_API_KEY', 're_W7NTeqaV_J8Lg8zR4zvpZtRn64A5YKrLJ', 'API Key for Resend email service')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 2. UNIFIED EMAIL DISPATCHER
-- This trigger handles sending emails for ANY notification record inserted for a REAL user.
CREATE OR REPLACE FUNCTION public.fn_dispatch_email_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_resend_key text;
    v_recipient_email text;
    v_subject_prefix text := '[Core Connect] ';
BEGIN
    -- Get Resend Key
    SELECT value INTO v_resend_key FROM public.system_config WHERE key = 'RESEND_API_KEY';
    IF v_resend_key IS NULL THEN RETURN NEW; END IF;

    -- Get Recipient Email
    SELECT email INTO v_recipient_email FROM auth.users WHERE id = NEW.recipient_id;
    IF v_recipient_email IS NULL THEN RETURN NEW; END IF;

    -- Adjust subject for Admins vs Students
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.recipient_id AND role = 'admin') THEN
        v_subject_prefix := '[ADMIN ALERT] ';
    END IF;

    -- Send Email via Resend
    PERFORM net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || v_resend_key,
            'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
            'from', 'Core Connect Academy <notifications@resend.dev>',
            'to', v_recipient_email,
            'subject', v_subject_prefix || NEW.title,
            'html', '<div style="font-family: sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; margin: auto;">' ||
                    '<div style="text-align: center; margin-bottom: 20px;">' ||
                    '<h2 style="color: #0066cc; margin: 0;">' || NEW.title || '</h2>' ||
                    '</div>' ||
                    '<div style="color: #4a5568; line-height: 1.6; font-size: 16px;">' ||
                    '<p>' || NEW.message || '</p>' ||
                    '</div>' ||
                    '<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #edf2f7; text-align: center; color: #a0aec0; font-size: 12px;">' ||
                    '<p>© 2026 Core Connect Academy • Learning that moves you forward.</p>' ||
                    '</div>' ||
                    '</div>'
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_dispatch_email_notification ON public.notifications;
CREATE TRIGGER tr_dispatch_email_notification
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.fn_dispatch_email_notification();

-- 3. VISITOR CONFIRMATION TRIGGER
-- Sent directly to the email in the application form (no recipient_id needed).
CREATE OR REPLACE FUNCTION public.fn_visitor_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
    v_resend_key text;
BEGIN
    SELECT value INTO v_resend_key FROM public.system_config WHERE key = 'RESEND_API_KEY';
    
    IF v_resend_key IS NOT NULL THEN
        PERFORM net.http_post(
            url := 'https://api.resend.com/emails',
            headers := jsonb_build_object(
                'Authorization', 'Bearer ' || v_resend_key,
                'Content-Type', 'application/json'
            ),
            body := jsonb_build_object(
                'from', 'Core Connect Academy <admissions@resend.dev>',
                'to', NEW.email,
                'subject', 'Application Received - Core Connect Academy',
                'html', '<div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 12px;">' ||
                        '<h1 style="color: #000;">Hello ' || NEW.full_name || ',</h1>' ||
                        '<p style="font-size: 16px; color: #333;">Thank you for your interest in Core Connect Academy. We have successfully received your enrollment application for the <strong>' || COALESCE(NEW.program_interest, 'tech program') || '</strong>.</p>' ||
                        '<p style="font-size: 16px; color: #333;">Our admissions team will review your details and reach out to you within 48 hours.</p>' ||
                        '<div style="margin: 30px 0; padding: 20px; bg-color: #f8fafc; border-left: 4px solid #0066cc;">' ||
                        '<p style="margin: 0; font-weight: bold;">What happens next?</p>' ||
                        '<ul style="color: #64748b; font-size: 14px;">' ||
                        '<li>Wait for our review confirmation.</li>' ||
                        '<li>Check your dashboard for any updates.</li>' ||
                        '</ul>' ||
                        '</div>' ||
                        '<p style="font-size: 12px; color: #94a3b8;">Core Connect Academy Admissions Team</p>' ||
                        '</div>'
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_visitor_confirmation_email ON public.applications;
CREATE TRIGGER tr_visitor_confirmation_email
AFTER INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.fn_visitor_confirmation_email();

-- 4. NEW MODULE ALERT TRIGGER
-- Notifies all enrolled students when a new module is added to their course.
CREATE OR REPLACE FUNCTION public.fn_notify_new_module_arrival()
RETURNS TRIGGER AS $$
DECLARE
    v_course_title text;
    v_student_id uuid;
BEGIN
    -- Get course title
    SELECT title INTO v_course_title FROM public.courses WHERE id = NEW.course_id;

    -- Loop through all enrolled students for this course
    FOR v_student_id IN 
        SELECT student_id FROM public.enrollments WHERE course_id = NEW.course_id AND status = 'active'
    LOOP
        INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
        VALUES (
            v_student_id,
            'New Module Released! 🚀',
            'A new module "' || NEW.title || '" has been added to your course: ' || v_course_title || '. Go check it out!',
            'info',
            jsonb_build_object(
                'source', 'new_module_dispatch',
                'course_id', NEW.course_id,
                'module_id', NEW.id
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_new_module_arrival ON public.modules;
CREATE TRIGGER tr_notify_new_module_arrival
AFTER INSERT ON public.modules
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_new_module_arrival();

-- 5. ENSURE GRADING ALERTS (Verify/Create trigger for assignment submissions)
-- This ensures that when a submission is updated with feedback, a notification is born.
-- The dispatcher (tr_dispatch_email_notification) will handle the actual email.
CREATE OR REPLACE FUNCTION public.fn_notify_assignment_graded_extended()
RETURNS TRIGGER AS $$
DECLARE
    v_assignment_title text;
BEGIN
    -- Trigger if feedback is newly added or score changes
    IF (OLD.admin_feedback IS NULL AND NEW.admin_feedback IS NOT NULL) OR 
       (OLD.grade_score IS DISTINCT FROM NEW.grade_score) THEN
        
        SELECT title INTO v_assignment_title
        FROM public.assignments
        WHERE id = NEW.assignment_id;
        
        INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
        VALUES (
            NEW.user_id,
            'Assignment Graded!',
            'Good news! Your submission for "' || COALESCE(v_assignment_title, 'your assignment') || '" has been graded. Review your feedback in the learning portal.',
            'success',
            jsonb_build_object(
                'source', 'assignment_graded',
                'submission_id', NEW.id,
                'score', NEW.grade_score
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_assignment_graded_extended ON public.assignment_submissions;
CREATE TRIGGER tr_notify_assignment_graded_extended
AFTER UPDATE ON public.assignment_submissions
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_assignment_graded_extended();

-- Final Cache Reload
NOTIFY pgrst, 'reload schema';
