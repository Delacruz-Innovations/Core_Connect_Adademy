-- MASTER PROFILE SECURITY: Student Immutability & RLS
-- Objective: Enforce that students can view their profiles but cannot change their Identity (Username/Role).

-- 1. Enable RLS on Profiles (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure a clean state
DROP POLICY IF EXISTS "Students can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Students can update own personal info" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- 3. Define the "View Own" Policy
CREATE POLICY "Students can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 4. Define the "Controlled Update" Policy
-- Students can change their full_name, but NOT their username or role.
CREATE POLICY "Students can update own personal info" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    username = username AND -- Effectively immutable because it's in the select but blocked by trigger below
    role = role -- Effectively immutable
);

-- 5. THE IMMUTABILITY TRIGGER: Absolute Prevention of Identity Theft
-- This trigger runs on the database and REJECTS any attempt to change role or username by a non-admin.
CREATE OR REPLACE FUNCTION public.enforce_profile_immutability()
RETURNS trigger AS $$
BEGIN
    -- If the user is NOT an admin, block changes to sensitive fields
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
        IF NEW.username != OLD.username THEN
            RAISE EXCEPTION 'Username is immutable and cannot be changed.';
        END IF;
        IF NEW.role != OLD.role THEN
            RAISE EXCEPTION 'Role escalation is forbidden.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_enforce_profile_immutability ON public.profiles;
CREATE TRIGGER tr_enforce_profile_immutability
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_immutability();

-- 6. Audit Logging for Profile Changes
-- Ensure we track sensitive actions
CREATE OR REPLACE FUNCTION public.log_profile_action()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (actor_id, action, metadata)
        VALUES (auth.uid(), 'profile_updated', jsonb_build_object('changes', 'Profile fields updated'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_log_profile_action ON public.profiles;
CREATE TRIGGER tr_log_profile_action
    AFTER UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_action();

-- 7. Force Schema Reload
NOTIFY pgrst, 'reload schema';
