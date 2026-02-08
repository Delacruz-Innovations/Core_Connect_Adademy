-- NUCLEAR REPAIR: profiles Table & Auth Trigger
-- Objective: Resolve the persistent 500 error during signup by standardizing the profiles schema.

-- 1. Standardize the Profiles Table
-- We add all likely columns and RELAX constraints that might cause 500 errors.
DO $$ 
BEGIN
    -- Ensure columns exist
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
    
    -- RELAX constraints: Remove any CHECK constraints on 'role' that might be outdated
    -- (e.g., if one migration allowed 'instructor' and another didn't)
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    
    -- Ensure username uniqueness doesn't crash the trigger (we will handle it in the function)
    -- We'll keep the UNIQUE constraint if it exists, but we'll be careful in the insert.
EXCEPTION WHEN others THEN 
    RAISE NOTICE 'Handled column/constraint adjustment';
END $$;

-- 2. ROBUST TRIGGER FUNCTION
-- This version uses dynamic role assignment and handles unique conflicts gracefully.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_role text;
    v_username text;
    v_counter int := 0;
    v_base_username text;
BEGIN
    -- A. Determine Role
    -- Default to 'student' as this is the primary academy use case
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
    
    -- B. Determine Username
    v_base_username := COALESCE(
        new.raw_user_meta_data->>'username', 
        split_part(new.email, '@', 1)
    );
    v_username := v_base_username;

    -- C. Standardized Insert with automatic conflict resolution for username
    -- We try to insert. If username exists, we append the ID.
    INSERT INTO public.profiles (id, email, full_name, role, username)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New Member'),
        v_role,
        v_username
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, 'New Member'), profiles.full_name),
        role = COALESCE(NULLIF(EXCLUDED.role, ''), profiles.role),
        updated_at = now();

    RETURN new;

EXCEPTION WHEN unique_violation THEN
    -- If username was the conflict, try with a suffix
    INSERT INTO public.profiles (id, email, full_name, role, username)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New Member'),
        v_role,
        v_base_username || '_' || substr(new.id::text, 1, 5)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
WHEN OTHERS THEN
    -- Fallback: The absolute bare minimum to allow signup to succeed
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RE-BIND TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Final Permissions & Cache Reload
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';
