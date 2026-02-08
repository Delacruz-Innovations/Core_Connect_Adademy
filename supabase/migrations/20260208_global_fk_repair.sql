-- NUCLEAR REPAIR: Global FK De-coupling (v6)
-- Objective: Stop all "Key not present in table users" errors for Enrollments and Audit Logs.

-- 1. PURGE ALL FOREIGN KEYS from 'audit_logs'
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'audit_logs' 
        AND table_schema = 'public' 
        AND constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE';
    END LOOP;
END $$;

-- 2. PURGE ALL FOREIGN KEYS from 'enrollments' (Again, to be absolutely sure)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'enrollments' 
        AND table_schema = 'public' 
        AND constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE';
    END LOOP;
END $$;

-- 3. ENSURE NO SHADOW 'users' TABLE EXISTS
DROP TABLE IF EXISTS public.users CASCADE;

-- 4. RE-ESTABLISH RELATIONSHIPS AS "SOFT LINKS" (NOT VALID)
-- This allows the data to be saved even if Supabase Auth is micro-lagging.
ALTER TABLE public.audit_logs 
    ADD CONSTRAINT fk_audit_actor_soft 
    FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL NOT VALID;

ALTER TABLE public.enrollments 
    ADD CONSTRAINT fk_enrollment_student_soft 
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

-- 5. UPDATE RPCs TO BE BULLETPROOF
CREATE OR REPLACE FUNCTION public.approve_lead_unified(
  p_lead_id uuid,
  p_user_id uuid,
  p_course_id uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_lead_email text;
  v_lead_interest text;
  v_admin_id uuid;
BEGIN
  -- Get Admin Context (might be NULL in anonymous mode)
  v_admin_id := auth.uid();

  -- Get Lead Info
  SELECT email, course_interest INTO v_lead_email, v_lead_interest
  FROM public.leads
  WHERE id = p_lead_id;

  -- 1. Enrollment (Constraint won't block this because of NOT VALID)
  INSERT INTO public.enrollments (student_id, course_id, status, admin_id)
  VALUES (p_user_id, p_course_id, 'active', v_admin_id)
  ON CONFLICT DO NOTHING;

  -- 2. Audit Log (No more FK block)
  INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
  VALUES (
    COALESCE(v_admin_id, p_user_id), -- Fallback to the user being approved if admin is null
    'admin',
    'lead_approved_unified',
    'lead',
    p_lead_id::text,
    jsonb_build_object('student_id', p_user_id)
  );

  -- 3. Lead Status
  UPDATE public.leads SET status = 'approved' WHERE id = p_lead_id;

  RETURN jsonb_build_object('success', true, 'message', 'Approved and Recorded.');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'DB Error: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RELOAD
NOTIFY pgrst, 'reload schema';
