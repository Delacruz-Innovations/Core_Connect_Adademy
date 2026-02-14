-- Fresh Admin Authentication - Email Based Check
-- Date: 2026-02-13
-- Objective: Tie admin authority directly to the authorized email, removing profile dependencies.

-- 1. Redefine the check_is_admin function
-- This function is used by RLS policies to determine if the caller is an admin.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  -- We check directly against the auth.users table for the authorized email
  -- Security Definer allows bypassing RLS on auth.users if needed
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND email = 'delacruzltd.sam@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

-- Note: Ensure that 'delacruzltd.sam@gmail.com' is already a user in auth.users.
-- Since the user successfully logged in earlier, this user must exist.
