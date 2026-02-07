-- Enhanced Enrollment Workflow Database Schema
-- This migration adds support for enrollments, audit logs, notifications, and email templates

-- 1. Create enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  courses text[] DEFAULT '{}', -- Array of course names/IDs
  payment_amount decimal(10,2),
  payment_method text CHECK (payment_method IN ('transfer', 'cash', 'crypto', 'pending')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial')),
  payment_notes text,
  admin_id uuid REFERENCES auth.users(id),
  admin_notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed', 'cancelled'))
);

-- 2. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  event_type text NOT NULL, -- 'application_submitted', 'application_approved', 'enrollment_created', etc.
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type text, -- 'application', 'enrollment', 'user', 'course'
  entity_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text
);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  read_at timestamptz,
  link text,
  metadata jsonb DEFAULT '{}'
);

-- 4. Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables text[] DEFAULT '{}', -- List of variables like {{student_name}}, {{course_name}}
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Add columns to applications table
DO $$ BEGIN
    ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS notified_at timestamptz;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS approved_at timestamptz;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS rejected_at timestamptz;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 6. Enable RLS on new tables
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for enrollments
DO $$ BEGIN
    CREATE POLICY "Students can view own enrollments" ON public.enrollments
        FOR SELECT TO authenticated
        USING (student_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view all enrollments" ON public.enrollments
        FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can insert enrollments" ON public.enrollments
        FOR INSERT TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can update enrollments" ON public.enrollments
        FOR UPDATE TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 8. RLS Policies for audit_logs
DO $$ BEGIN
    CREATE POLICY "Admins can view audit logs" ON public.audit_logs
        FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "System can insert audit logs" ON public.audit_logs
        FOR INSERT TO authenticated, anon
        WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. RLS Policies for notifications
DO $$ BEGIN
    CREATE POLICY "Users can view own notifications" ON public.notifications
        FOR SELECT TO authenticated
        USING (recipient_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own notifications" ON public.notifications
        FOR UPDATE TO authenticated
        USING (recipient_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "System can insert notifications" ON public.notifications
        FOR INSERT TO authenticated
        WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. RLS Policies for email_templates
DO $$ BEGIN
    CREATE POLICY "Admins can manage email templates" ON public.email_templates
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 11. Insert default email templates
INSERT INTO public.email_templates (name, subject, body, variables)
VALUES 
(
    'application_submitted',
    'Application Received - {{student_name}}',
    'Dear {{student_name}},

Thank you for submitting your application to Core Connect Academy!

Your application reference number is: {{application_id}}

We have received your application for the {{program_name}} program and our admissions team will review it shortly.

What happens next:
1. Our team will review your application within 2-3 business days
2. You will receive an email notification once your application has been reviewed
3. If approved, you will receive further instructions on course enrollment and payment

If you have any questions, please don''t hesitate to contact us.

Best regards,
Core Connect Academy Team',
    ARRAY['student_name', 'application_id', 'program_name']
),
(
    'application_approved',
    'Congratulations! Your Application Has Been Approved',
    'Dear {{student_name}},

Congratulations! We are pleased to inform you that your application has been approved!

Enrollment Details:
- Assigned Courses: {{courses}}
- Payment Amount: ${{payment_amount}}
- Payment Methods Available: {{payment_methods}}

Next Steps:
1. Complete your payment using one of the available methods
2. You will receive a password setup link via email
3. Set up your secure password to access your student dashboard

We look forward to having you as part of our learning community!

Best regards,
Core Connect Academy Team',
    ARRAY['student_name', 'courses', 'payment_amount', 'payment_methods']
),
(
    'password_setup',
    'Set Up Your Password - Core Connect Academy',
    'Dear {{student_name}},

Welcome to Core Connect Academy!

Your account has been created and you''re almost ready to start learning. Please set up your password to access your student dashboard.

Click the link below to set your password:
{{password_setup_link}}

This link will expire in 24 hours for security reasons.

Password Requirements:
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

Once you''ve set your password, you can log in using:
- Username: {{username}}
- Password: (the one you create)

Best regards,
Core Connect Academy Team',
    ARRAY['student_name', 'password_setup_link', 'username']
)
ON CONFLICT (name) DO NOTHING;

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_application_id ON public.enrollments(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
