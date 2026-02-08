-- Add email column to profiles table for username-based login
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Update existing profiles from auth.users if possible
-- This is a safety measure for existing users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;
