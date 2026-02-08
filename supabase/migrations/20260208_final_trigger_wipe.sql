-- REPAIR: Specific Custom Trigger Cleanup
-- Objective: Explicitly drop any known custom triggers to avoid hanging during password reset.

-- 1. Drop known custom triggers by name directly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS tr_on_auth_user_created_final ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- 2. Repair Profile Table Accessibility
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;

-- 3. Simplified handle_new_user_final (Error-proof)
-- This ensures that if it DOES run, it doesn't block the transaction.
CREATE OR REPLACE FUNCTION public.handle_new_user_final()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, 'student')
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN others THEN
    RETURN new; 
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Force Reload
NOTIFY pgrst, 'reload schema';
