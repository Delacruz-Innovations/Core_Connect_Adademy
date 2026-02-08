-- PURGE & RESET AUTH TRIGGERS
-- Objective: Delete all custom triggers on auth.users and bypass profile creation to test core signup.

-- 1. Drop the trigger from EVERY possible schema/table combination it might have been placed in
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- 2. Delete all variations of the trigger function
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.on_auth_user_created();

-- 3. RELAX Profiles table to ensure it doesn't block ANY insertion
-- This ensures that even if we manually insert later, it won't fail.
ALTER TABLE public.profiles ALTER COLUMN role DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;

-- 4. Create an ULTRA SIMPLE, ERROR-PROOF function (no logic, just return)
-- We will use this to confirm if any trigger is even allowed to run.
CREATE OR REPLACE FUNCTION public.handle_new_user_diagnostic()
RETURNS trigger AS $$
BEGIN
  -- DO NOTHING. Just allow the user to be created.
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Re-bind only the diagnostic trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_diagnostic();

-- 6. Grant permissions
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;

-- 7. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
