-- Migration: Student Enrollment Lifecycle (Supabase-Native)
-- Objective: Implement Phased Enrollment Lifecycle (Lead -> Admin Approved -> Student)
-- Date: 2026-02-08

-- 1. LEADS TABLE (VISITOR ENROLLMENT)
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    course_interest text,
    notes text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
    notified_at timestamptz -- Track if confirmation email was sent
);

-- 2. ENROLLMENTS HARDENING
-- Ensure enrollments table is ready for the lifecycle
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'enrollments') THEN
        CREATE TABLE public.enrollments (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            course_id uuid, -- Reference to courses table
            status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed')),
            metadata jsonb DEFAULT '{}'
        );
    END IF;
END $$;

-- 3. AUDIT LOG TRIGGER (LEAD SUBMISSION)
CREATE OR REPLACE FUNCTION public.fn_on_lead_submitted()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
        NULL, 
        'system', 
        'application_submitted', 
        'lead', 
        NEW.id::text, 
        jsonb_build_object(
            'email', NEW.email,
            'course', NEW.course_interest
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_lead_submitted ON public.leads;
CREATE TRIGGER tr_on_lead_submitted
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.fn_on_lead_submitted();

-- 4. ROLE ACTIVATION TRIGGER (REGISTERED_USER -> STUDENT)
CREATE OR REPLACE FUNCTION public.fn_activate_student_role()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET role = 'student'
    WHERE id = NEW.student_id
    AND role = 'registered_user';
    
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
        NEW.student_id, 
        'system', 
        'student_role_activated', 
        'profile', 
        NEW.student_id::text, 
        jsonb_build_object('enrollment_id', NEW.id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_activate_student_role ON public.enrollments;
CREATE TRIGGER tr_activate_student_role
AFTER INSERT ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.fn_activate_student_role();

-- 5. RLS POLICIES
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existng policies to allow safe re-run
DROP POLICY IF EXISTS "Enable insert for anon (applicants)" ON public.leads;
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins manage everything" ON public.enrollments;

-- Visitors can submit applications
CREATE POLICY "Enable insert for anon (applicants)" ON public.leads FOR INSERT TO anon WITH CHECK (true);

-- Admins can view and manage leads
CREATE POLICY "Admins can manage leads" ON public.leads FOR ALL TO authenticated USING (public.check_is_admin());

-- Students can see their own enrollments
CREATE POLICY "Students can view own enrollments" ON public.enrollments FOR SELECT TO authenticated USING (student_id = auth.uid());

-- Admins Manage all enrollments
CREATE POLICY "Admins manage everything" ON public.enrollments FOR ALL TO authenticated USING (public.check_is_admin());
