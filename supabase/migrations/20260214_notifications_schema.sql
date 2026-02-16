-- Centralized Notification System Repair & Enhancement
-- Aligns with 20260208_notification_triggers.sql schema

-- 1. Ensure columns exist (Adaptive to previous migrations)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE user_role_type AS ENUM ('admin', 'student');
    END IF;
END $$;

-- 2. Enhance existing table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS role user_role_type DEFAULT 'student',
ADD COLUMN IF NOT EXISTS link TEXT;

-- 3. Update Policies (Use recipient_id to match existing schema)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Admins can view admin notifications" ON public.notifications;
CREATE POLICY "Admins can view admin notifications" 
ON public.notifications FOR SELECT 
USING (role = 'admin' OR public.check_is_admin());

-- 4. Triggers for automatic notifications

-- 1. Notify Admin when a new application (Lead) is created
CREATE OR REPLACE FUNCTION notify_admin_new_lead()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id uuid;
BEGIN
    -- Get an admin to anchor this to (or leave NULL for broad visibility if policies allow)
    SELECT id INTO v_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;

    INSERT INTO public.notifications (recipient_id, role, title, message, type, link)
    VALUES (
        v_admin_id,
        'admin', 
        'New Interest Registered', 
        'A new lead, ' || NEW.full_name || ', has registered interest in ' || NEW.program_interest,
        'info',
        '/admin/applications'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_new_application ON public.applications;
CREATE TRIGGER tr_on_new_application
AFTER INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION notify_admin_new_lead();

-- 2. Notify Admin when a new assignment is submitted
CREATE OR REPLACE FUNCTION notify_admin_new_assignment()
RETURNS TRIGGER AS $$
DECLARE
    v_student_name TEXT;
    v_admin_id uuid;
BEGIN
    SELECT full_name INTO v_student_name FROM public.profiles WHERE id = NEW.user_id;
    SELECT id INTO v_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    INSERT INTO public.notifications (recipient_id, role, title, message, type, link)
    VALUES (
        v_admin_id,
        'admin', 
        'New Assignment Submission', 
        COALESCE(v_student_name, 'A student') || ' submitted an assignment.',
        'success',
        '/admin/submissions'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_new_submission ON public.assignment_submissions;
CREATE TRIGGER tr_on_new_submission
AFTER INSERT ON public.assignment_submissions
FOR EACH ROW EXECUTE FUNCTION notify_admin_new_assignment();
