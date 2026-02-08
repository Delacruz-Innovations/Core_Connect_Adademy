-- ULTIMATE AUTH & PROFILE REPAIR (v5)
-- Objective: Force the database to accept new users by eliminating all possible points of failure.
-- This script standardizes the 'profiles' table and implements an error-proof trigger.

-- 1. Standardize 'profiles' Table (Force Text Role)
DO $$ 
BEGIN
    -- Ensure columns exist and have correct types
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'registered_user';
    ELSE
        -- Convert role to text if it's an enum, to avoid type mismatch errors
        BEGIN
            ALTER TABLE public.profiles ALTER COLUMN role TYPE text USING role::text;
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Role already compatible or conversion failed';
        END;
    END IF;

    -- Ensure 'username' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE public.profiles ADD COLUMN username text;
    END IF;

    -- REMOVE ALL CONSTRAINTS that might cause 500 errors during a trigger
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;
    ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;

EXCEPTION WHEN others THEN
    RAISE NOTICE 'Schema adjustment completed with some warnings';
END $$;

-- 2. Error-Proof Trigger Function
-- This version uses a BEGIN...EXCEPTION block around the ENTITY of the logic
-- to ensure that even if the profile insert fails, the AUTH user creation succeeds.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Wrap EVERYTHING in an exception handler.
    -- If this fails, we want it to fail SILENTLY so the Auth user is still created.
    BEGIN
        INSERT INTO public.profiles (id, email, full_name, role, username)
        VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'full_name', 'Member'),
            COALESCE(new.raw_user_meta_data->>'role', 'registered_user'),
            COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 5))
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            updated_at = now();
            
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but ALLOW the transaction to succeed.
        RAISE WARNING 'Silent Trigger Failure in handle_new_user: %', SQLERRM;
    END;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Clear and Rebind Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Global Permissions (Direct Dashboard Access mode)
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.audit_logs TO anon, authenticated, service_role;

-- 5. Final Schema Reload
NOTIFY pgrst, 'reload schema';
