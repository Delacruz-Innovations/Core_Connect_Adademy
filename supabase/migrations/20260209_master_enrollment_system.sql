-- 1. DROP OLD TABLES IF NECESSARY
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;

-- 2. INFRASTRUCTURE & ENUMS (Ensuring clean slate for the 'MASTER' flow)
CREATE TABLE IF NOT EXISTS public.program_types (
    name text PRIMARY KEY
);

INSERT INTO public.program_types (name) VALUES 
('Mentorship Program'), 
('Apprenticeship Program')
ON CONFLICT DO NOTHING;

-- 3. ENROLLMENT DATA MODEL (MANDATORY)
CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    
    -- IDENTITY
    full_name text NOT NULL,
    username text UNIQUE NOT NULL,
    email text NOT NULL,
    
    -- CONTACT & LOCATION
    country text NOT NULL,
    city text NOT NULL,
    postcode text NOT NULL,
    phone text NOT NULL,
    
    -- BACKGROUND
    job_role text NOT NULL,
    program_interest text NOT NULL REFERENCES public.program_types(name) ON DELETE RESTRICT,
    motivation_text text NOT NULL,
    computer_literacy_score int NOT NULL CHECK (computer_literacy_score BETWEEN 1 AND 10),
    
    -- DISCOVERY
    discovery_source text NOT NULL,
    referral_name text, -- Nullable
    
    -- COURSE SELECTION (CRITICAL)
    requested_course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    
    -- ADMIN STATE
    assigned_course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_id uuid REFERENCES auth.users(id),
    reviewed_at timestamptz
);

-- 3. ENROLLMENTS SYNC
-- Ensure enrollments table is consistent with the access model
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'enrollments') THEN
        CREATE TABLE public.enrollments (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            course_id uuid REFERENCES public.courses(id) ON DELETE RESTRICT,
            application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
            status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'completed'))
        );
    END IF;
END $$;

-- 4. RLS ENFORCEMENT (NON-NEGOTIABLE)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- STUDENTS: ONLY see approved and assigned courses
DROP POLICY IF EXISTS "Students see approved courses" ON public.courses;
CREATE POLICY "Students see approved courses" 
ON public.courses 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.course_id = courses.id 
        AND e.student_id = auth.uid()
        AND e.status = 'active'
    )
);

-- APPLICANTS: Can only insert (submit)
DROP POLICY IF EXISTS "Enable insert for applicants" ON public.applications;
CREATE POLICY "Enable insert for applicants" 
ON public.applications 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (status = 'pending');

-- ADMINS: Absolute Power (Managed by check_is_admin())
-- Already covered by 'Admin God Policy' in canonical migration, but re-asserting for clarity
DROP POLICY IF EXISTS "Admins manage applications" ON public.applications;
CREATE POLICY "Admins manage applications" 
ON public.applications 
FOR ALL 
TO authenticated 
USING (public.check_is_admin());

-- 5. ADMIN APPROVAL LOGIC (RPC)
CREATE OR REPLACE FUNCTION public.approve_application(
    target_application_id uuid,
    final_course_id uuid
)
RETURNS void AS $$
DECLARE
    app_record RECORD;
    target_user_id uuid;
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

    -- Find or create user? 
    -- For this flow, we assume the student is already an authenticated 'registered_user' 
    -- or we link via email. In Supabase Native, we typically approve an existing auth record.
    SELECT id INTO target_user_id FROM auth.users WHERE email = app_record.email;
    
    -- Update Application Status
    UPDATE public.applications
    SET 
        status = 'approved',
        assigned_course_id = final_course_id,
        admin_id = auth.uid(),
        reviewed_at = now()
    WHERE id = target_application_id;

    -- Create/Update Enrollment
    INSERT INTO public.enrollments (student_id, course_id, application_id, status)
    VALUES (target_user_id, final_course_id, target_application_id, 'active')
    ON CONFLICT (student_id, course_id) DO UPDATE SET status = 'active';

    -- Activate Profile Role
    UPDATE public.profiles
    SET role = 'student'
    WHERE id = target_user_id;

    -- Audit
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
        auth.uid(), 
        'admin', 
        'enrollment_approved', 
        'application', 
        target_application_id::text, 
        jsonb_build_object('course_id', final_course_id, 'student_id', target_user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. AUDIT TRIGGERS
CREATE OR REPLACE FUNCTION public.fn_audit_application_submission()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
        NULL, 
        'anon', 
        'enrollment_submitted', 
        'application', 
        NEW.id::text, 
        jsonb_build_object('requested_course_id', NEW.requested_course_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_audit_application_submission
AFTER INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_application_submission();
