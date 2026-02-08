-- Migration: Unified Lead Approval RPC
-- Objective: Handle Lead -> User -> Enrollment in a single database transaction.
-- This bypasses all client-side race conditions and schema pathing issues.

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
  -- 1. Get Admin Context
  v_admin_id := auth.uid();

  -- 2. Fetch Lead Details
  SELECT email, course_interest INTO v_lead_email, v_lead_interest
  FROM public.leads
  WHERE id = p_lead_id;

  IF v_lead_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Lead not found.');
  END IF;

  -- 3. Create Enrollment (Use explicit schema to avoid shadowing)
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
      'source', 'unified_lead_approval',
      'interest', v_lead_interest
    )
  )
  ON CONFLICT DO NOTHING;

  -- 4. Update Lead Status
  UPDATE public.leads 
  SET status = 'approved' 
  WHERE id = p_lead_id;

  -- 5. Audit Log
  INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
  VALUES (
    v_admin_id,
    'admin',
    'lead_approved_unified',
    'lead',
    p_lead_id::text,
    jsonb_build_object('email', v_lead_email, 'student_id', p_user_id)
  );

  RETURN jsonb_build_object('success', true, 'message', 'Lead approved and student enrolled.');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.approve_lead_unified TO anon, authenticated, service_role;

-- RE-FIX THE FK ONE MORE TIME (Aggressive)
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_fkey;
ALTER TABLE public.enrollments 
  ADD CONSTRAINT enrollments_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;
