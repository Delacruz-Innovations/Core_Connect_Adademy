-- Fix Audit Logs Relationship
-- Objective: Allow PostgREST to join audit_logs with profiles by adding an explicit foreign key.

-- 1. DROP old constraint if it exists (it points to auth.users by default in many setups)
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey;

-- 2. ADD explicit constraint to public.profiles
-- This enables the join logic in AuditLogs.jsx
ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_actor_id_fkey 
FOREIGN KEY (actor_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- 3. GRANT permissions just in case
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
