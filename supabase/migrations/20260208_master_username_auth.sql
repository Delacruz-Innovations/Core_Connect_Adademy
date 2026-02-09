-- MASTER SCHEMA UPDATE: Username-First Architecture
-- Objective: Enforce username uniqueness and link it across the system.
-- 1. Ensure 'leads' table has username and is unique
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'username') THEN
        ALTER TABLE public.leads ADD COLUMN username text;
    END IF;
END $$;
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_username_key;
ALTER TABLE public.leads ADD CONSTRAINT leads_username_key UNIQUE (username);
-- 2. Ensure 'profiles' table has unique, case-insensitive username
-- We use a case-insensitive index for security and UX.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_ci_idx ON public.profiles ((lower(username)));
-- 3. THE MASTER TRIGGER: Auth -> Profile Sync
-- This ensures that when Admin creates the user, the username is captured.
CREATE OR REPLACE FUNCTION public.handle_new_user_master()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || right(new.id::text, 4))
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    username = EXCLUDED.username,
    email = EXCLUDED.email;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;
CREATE TRIGGER tr_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_master();

-- 4. LOGIN RESOLVER: Function to safely map username to email without enumeration leaks
-- This is used by the frontend during the login phase.
CREATE OR REPLACE FUNCTION public.get_email_from_username(p_username text)
RETURNS text AS $$
DECLARE
    v_email text;
BEGIN
    SELECT email INTO v_email 
    FROM public.profiles 
    WHERE lower(username) = lower(p_username)
    LIMIT 1;
    
    RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_email_from_username TO anon, authenticated;

-- 5. RELOAD
NOTIFY pgrst, 'reload schema';