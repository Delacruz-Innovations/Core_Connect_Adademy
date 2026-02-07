-- EMERGENCY: Promote all users to Admin (Dev Only)
-- Use this if you are locked out of the Admin Portal.

-- 1. Update all existing profiles to have 'admin' role
UPDATE public.profiles
SET role = 'admin'
WHERE role IS DISTINCT FROM 'admin';

-- 2. Verify RLS policies allow profiles to be read
-- (Ensure policies exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;
