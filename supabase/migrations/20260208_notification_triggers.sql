-- Migration: Notification Triggers for Enrollment Lifecycle
-- Objective: Automate notification creation for key lifecycle events
-- Date: 2026-02-08
-- Fix: Aligned column names with existing schema (recipient_id instead of user_id, read instead of is_read)

-- 1. NOTIFICATIONS TABLE (Ensure it exists matching 20260207_enhanced_enrollment.sql)
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text,
    type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop duplicate policies if they exist to avoid conflicts/errors
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;

-- Re-create policies using correct column names
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = recipient_id);

CREATE POLICY "Admins manage notifications" ON public.notifications
    FOR ALL TO authenticated USING (public.check_is_admin());

-- 2. TRIGGER ON ENROLLMENT (WELCOME NOTIFICATION)
CREATE OR REPLACE FUNCTION public.fn_notify_on_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (recipient_id, title, message, type, metadata)
    VALUES (
        NEW.student_id,
        'Welcome to Core Connect Academy!',
        'Your enrollment has been approved. You can now access your course materials.',
        'success',
        jsonb_build_object('source', 'enrollment_trigger', 'course_id', NEW.course_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_enrollment ON public.enrollments;
CREATE TRIGGER tr_notify_on_enrollment
AFTER INSERT ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.fn_notify_on_enrollment();
