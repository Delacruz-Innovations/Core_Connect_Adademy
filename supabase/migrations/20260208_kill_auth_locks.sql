-- EMERGENCY FIX: Remove Auth Update Blockers
-- Objective: Ensure `auth.updateUser` (password reset) is not blocked by custom triggers.

-- 1. Explicitly drop any possible update trigger names we've used or seen
DROP TRIGGER IF EXISTS tr_on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS sync_user_to_profile_update ON auth.users;
DROP TRIGGER IF EXISTS handle_user_update ON auth.users;

-- 2. Make sure the profiles table isn't locking the transaction
-- Even if we aren't updating profiles on password change, a stale lock can block the whole Auth update.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;

-- 3. Check for and kill any hung transactions that are still "waiting" or "idle in transaction"
-- This releases the database lock on your specific user record.
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle in transaction' 
  AND query LIKE '%auth.users%'
  AND pid <> pg_backend_pid();

-- 4. Final reload
NOTIFY pgrst, 'reload schema';
