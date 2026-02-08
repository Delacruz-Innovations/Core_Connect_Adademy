-- NUCLEAR REPAIR: Enrollment Foreign Key & RPC Diagnostics
-- Objective: Force the enrollment table to use the correct Auth link and provide clear errors.

-- 1. Aggressive Constraint Purge
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop EVERY foreign key on enrollments to ensure no "shadow" constraints remain.
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

-- 2. Create the Cleanest Possible Foreign Key
-- We use a unique name 'fk_enrollment_student_auth' to avoid any naming collisions.
ALTER TABLE public.enrollments 
  ADD CONSTRAINT fk_enrollment_student_auth 
  FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Update the RPC with pre-flight checks
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
  v_exists_in_auth boolean;
BEGIN
  -- Pre-flight check: Does this user actually exist in auth.users?
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) INTO v_exists_in_auth;
  
  IF NOT v_exists_in_auth THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'DATABASE SYNC ERROR: User ID ' || p_user_id || ' was not found in the Auth system yet. Please wait a few seconds and try again.'
    );
  END IF;

  v_admin_id := auth.uid();

  SELECT email, course_interest INTO v_lead_email, v_lead_interest
  FROM public.leads
  WHERE id = p_lead_id;

  IF v_lead_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Lead record not found.');
  END IF;

  -- Insert into enrollments
  INSERT INTO public.enrollments (
    student_id, 
    course_id, 
    status, 
    admin_id,
    metadata
  )
  VALUES (
    p_user_id,
    p_course_id,
    'active',
    v_admin_id,
    jsonb_build_object(
      'lead_id', p_lead_id,
      'source', 'unified_lead_approval_v3',
      'interest', v_lead_interest
    )
  )
  ON CONFLICT DO NOTHING;

  UPDATE public.leads SET status = 'approved' WHERE id = p_lead_id;

  RETURN jsonb_build_object('success', true, 'message', 'Lead approved and student enrolled successfully.');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'SQL Error: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Reload API Cache
NOTIFY pgrst, 'reload schema';
