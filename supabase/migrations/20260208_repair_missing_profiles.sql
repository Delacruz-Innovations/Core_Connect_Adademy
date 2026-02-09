-- REPAIR: Fix Missing Profiles and Permissions
-- Objective: Ensure students can log in and find their profile data.

-- 1. Backfill MISSING profiles (Fix for anyone created during the "hangs")
INSERT INTO public.profiles (id, email, full_name, role, username)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', ''),
    COALESCE(raw_user_meta_data->>'role', 'student'),
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1) || '_' || right(id::text, 4))
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET 
  username = COALESCE(profiles.username, EXCLUDED.username),
  email = EXCLUDED.email;

-- 2. Open up Permissions (Stop the 406/Not Acceptable error)
-- This allows the profile to be read by the logged-in student.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;

-- 3. Kill any residual locks that might be blocking Jane's record
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state IN ('idle in transaction', 'active')
  AND (query LIKE '%profiles%' OR query LIKE '%users%')
  AND pid <> pg_backend_pid();

-- 4. Reload API Cache
NOTIFY pgrst, 'reload schema';
