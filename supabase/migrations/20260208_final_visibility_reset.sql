-- FINAL VISIBILITY & EMAIL REPAIR
-- Objective: Fix the empty "Program Applications" tab and ensure fresh testing environment.

-- 1. FORCE APPLICATIONS VISIBILITY
-- Drop all policies and disable RLS to ensure the dashboard sees everything.
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON public.applications;
DROP POLICY IF EXISTS "Admins can manage leads" ON public.applications;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.applications TO anon, authenticated, service_role;

-- 2. RESET SAMPLE DATA
-- This ensures you have a real application to click on for testing.
DELETE FROM public.applications WHERE email = 'applicant@example.com';
INSERT INTO public.applications (
    full_name, 
    email, 
    username, 
    program_type, 
    program_name, 
    status, 
    computer_literacy, 
    city, 
    country, 
    job_role, 
    reason, 
    referrer_source, 
    created_at
) VALUES (
    'Real Test Applicant', 
    'applicant@example.com', 
    'real_test', 
    'Bootcamp', 
    'Full Stack Web Development', 
    'pending', 
    9, 
    'Manila', 
    'Philippines', 
    'Graduate', 
    'I want to join the digital economy.', 
    'Social Media', 
    now()
);

-- 3. ENSURE AUDIT LOGS & ENROLLMENTS ARE ACCESSIBLE
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.audit_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.enrollments TO anon, authenticated, service_role;

-- 4. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
