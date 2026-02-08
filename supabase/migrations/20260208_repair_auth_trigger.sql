-- Migration: Repair Auth Trigger for New Users
-- Objective: Fix the 500 error "Database error saving new user" during signUp.
-- Rationale: This error is almost always caused by a failing trigger on auth.users 
-- that tries to insert into public.profiles but fails due to schema mismatches.

-- 1. Ensure Profile Table is Correct
-- We use a combination of columns from various migrations to ensure compatibility.
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    username text UNIQUE,
    role text DEFAULT 'registered_user',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Create/Repair the Trigger Function
-- This function captures metadata sent during signUp (like full_name and role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'registered_user'),
    -- Generate a default username from email if not provided
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 5))
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    role = COALESCE(NULLIF(EXCLUDED.role, ''), profiles.role);
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the Trigger to auth.users
-- We drop it first to ensure a clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
