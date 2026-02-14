-- Admin Email Notifications Setup
-- Date: 2026-02-14
-- Objective: Automatically email the admin whenever an administrative notification is generated.

-- 1. Enable pg_net extension for asynchronous HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Secure Configuration Table (if not exists)
CREATE TABLE IF NOT EXISTS public.system_config (
    key text PRIMARY KEY,
    value text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on system_config but restrict access to admins only
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage system_config" ON public.system_config;
CREATE POLICY "Admins can manage system_config" ON public.system_config
    FOR ALL TO authenticated
    USING (public.check_is_admin());

-- 3. Insert Resend API Key
INSERT INTO public.system_config (key, value, description)
VALUES ('RESEND_API_KEY', 're_W7NTeqaV_J8Lg8zR4zvpZtRn64A5YKrLJ', 'API Key for Resend email service')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 4. Email Notification Function
CREATE OR REPLACE FUNCTION public.fn_email_admin_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_resend_key text;
    v_admin_email text := 'delacruzltd.sam@gmail.com';
BEGIN
    -- Only trigger for administrative notifications (recipient is the admin)
    -- We identify the admin by the email check in check_is_admin() logic, 
    -- but here we simplify by checking if the recipient_id matches an admin profile
    -- OR we just check the title/type if we want to be specific.
    -- For now, we trigger if the recipient role is admin.
    
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.recipient_id AND role = 'admin') THEN
        
        -- Get Resend Key
        SELECT value INTO v_resend_key FROM public.system_config WHERE key = 'RESEND_API_KEY';
        
        IF v_resend_key IS NOT NULL THEN
            -- Fire the email asynchronously via pg_net
            PERFORM net.http_post(
                url := 'https://api.resend.com/emails',
                headers := jsonb_build_object(
                    'Authorization', 'Bearer ' || v_resend_key,
                    'Content-Type', 'application/json'
                ),
                body := jsonb_build_object(
                    'from', 'Core Connect Academy <notifications@resend.dev>',
                    'to', v_admin_email,
                    'subject', '[ADMIN ALERT] ' || NEW.title,
                    'html', '<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">' ||
                            '<h2 style="color: #0066cc;">' || NEW.title || '</h2>' ||
                            '<p>' || NEW.message || '</p>' ||
                            '<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">' ||
                            '<p style="font-size: 12px; color: #999;">This is an automated administrative alert from Core Connect Academy.</p>' ||
                            '</div>'
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create Trigger
DROP TRIGGER IF EXISTS tr_email_admin_notification ON public.notifications;
CREATE TRIGGER tr_email_admin_notification
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.fn_email_admin_notification();

-- 6. Force Cache Reload
NOTIFY pgrst, 'reload schema';
