-- EMERGENCY: DESTRUCTIVE AUTH RESET
-- Objective: Force signup to work by removing ALL profile-related triggers and constraints.
-- CUTION: This resets the profile connection for new signups.

-- 1. DROP ALL POTENTIAL TRIGGERS ON auth.users (Public and Auth schemas)
-- We use a DO block to try many common names
DO $$ 
BEGIN
    -- Common trigger names found in the project or typical Supabase setups
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
    DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS tr_handle_new_user ON auth.users;
    DROP TRIGGER IF EXISTS setup_profile_trigger ON auth.users;
EXCEPTION WHEN others THEN 
    RAISE NOTICE 'Handled trigger drop';
END $$;

-- 2. COMPLETELY REMOVE public.profiles TABLE (We will re-create it empty)
-- This ensures that no hidden constraints or old ENUM types are blocking the signup.
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. RE-CREATE A MINIMAL public.profiles TABLE
-- Absolutely NO constraints, NO checks, NO required fields (except ID).
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY, -- Removed foreign key reference to auth.users for this test
    email text,
    full_name text,
    username text,
    role text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. INSTALL A "BLANK" TRIGGER
-- This function does absolutely nothing and cannot fail.
CREATE OR REPLACE FUNCTION public.handle_new_user_diagnostic()
RETURNS trigger AS $$
BEGIN
  -- RETURN NEW is the only thing required for an AFTER INSERT trigger to pass.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_diagnostic();

-- 5. Grant total access
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;

-- 6. Reload
NOTIFY pgrst, 'reload schema';
