-- DIAGNOSTIC: Check Applications and Enrollment State
-- 1. Check if applications table has pending records
SELECT id, full_name, email, status FROM public.applications;

-- 2. Check leads status
SELECT id, email, status FROM public.leads;

-- 3. Check if any users exist in profiles
SELECT id, email, full_name, role FROM public.profiles;

-- 4. Check RLS status of applications
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'applications';
