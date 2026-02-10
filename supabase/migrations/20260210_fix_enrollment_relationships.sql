-- 🛠️ REPAIR: Fix Enrollment Relationships for Admin Dashboard
-- Objective: Ensure PostgREST can resolve profiles and applications joins.

-- 1. DROP old constraints from public.enrollments
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS fk_enrollment_student_soft;
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_fkey;
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_application_id_fkey;

-- 2. ADD explicit relationship to profiles for student_id
-- This allows .select('profiles:student_id(full_name)')
ALTER TABLE public.enrollments 
ADD CONSTRAINT enrollments_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 3. ADD explicit relationship to applications
-- This allows .select('application:application_id(program_interest)')
ALTER TABLE public.enrollments 
ADD CONSTRAINT enrollments_application_id_fkey 
FOREIGN KEY (application_id) 
REFERENCES public.applications(id) 
ON DELETE SET NULL;

-- 4. REFRESH relationship for audit_logs (actor_id -> profiles)
-- This ensures results in AuditLogs.jsx don't fail for PostgREST joins
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS actor_id_profiles_fkey; -- Possible old name
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey;
ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_actor_id_fkey 
FOREIGN KEY (actor_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- 5. ENSURE payment_status column exists (it might be missing in 'master' schema)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'payment_status') THEN
        ALTER TABLE public.enrollments ADD COLUMN payment_status text DEFAULT 'pending';
    END IF;
END $$;

-- 5. RELOAD PostgREST
NOTIFY pgrst, 'reload schema';
