-- Migration: Robust Approval RPC (V2)
-- Objective: Allow application approval even if a student profile hasn't been created yet.
-- This ensures the "Approve" button doesn't crash during testing or for offline-first workflows.

CREATE OR REPLACE FUNCTION public.approve_application_final(
  p_application_id uuid,
  p_courses text[] DEFAULT '{}',
  p_payment_amount text DEFAULT '0',
  p_payment_method text DEFAULT 'pending',
  p_payment_status text DEFAULT 'pending',
  p_admin_notes text DEFAULT ''
)
RETURNS jsonb AS $$
DECLARE
  v_email text;
  v_student_id uuid;
  v_admin_id uuid;
  v_program_name text;
  v_result jsonb;
BEGIN
  -- 1. Identify Actor (Server-side)
  v_admin_id := auth.uid();

  -- 2. Fetch Application Details
  SELECT email, program_name INTO v_email, v_program_name
  FROM public.applications
  WHERE id = p_application_id;

  IF v_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Application not found.');
  END IF;

  -- 3. Resolve Student ID (Try to find existing profile)
  SELECT id INTO v_student_id FROM public.profiles WHERE email = v_email LIMIT 1;

  -- 4. UPDATE APPLICATION STATUS (Always work)
  UPDATE public.applications
  SET 
    status = 'approved',
    approved_at = now(),
    admin_id = COALESCE(v_admin_id, admin_id)
  WHERE id = p_application_id;

  -- 5. CONDITIONAL ENROLLMENT (Only if student exists)
  IF v_student_id IS NOT NULL THEN
    INSERT INTO public.enrollments (
      student_id, 
      course_id, -- New schema compatibility
      metadata,
      status,
      admin_id
    )
    VALUES (
      v_student_id,
      NULL, -- We can't easily resolve the ID here from just text names yet
      jsonb_build_object(
        'application_id', p_application_id,
        'program', v_program_name,
        'requested_courses', p_courses,
        'payment', jsonb_build_object(
          'amount', p_payment_amount,
          'method', p_payment_method,
          'status', p_payment_status
        )
      ),
      'active',
      v_admin_id
    )
    ON CONFLICT DO NOTHING;

    -- Update audit log
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
      v_admin_id, 
      'admin', 
      'application_approved_with_enrollment', 
      'application', 
      p_application_id::text, 
      jsonb_build_object('email', v_email, 'student_id', v_student_id)
    );

    v_result := jsonb_build_object(
      'success', true, 
      'message', 'Application approved and student enrolled successfully.',
      'enrolled', true
    );
  ELSE
    -- LOG APPROVAL BUT NO ENROLLMENT
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
      v_admin_id, 
      'admin', 
      'application_approved_pending_registration', 
      'application', 
      p_application_id::text, 
      jsonb_build_object('email', v_email, 'note', 'No student profile found yet')
    );

    v_result := jsonb_build_object(
      'success', true, 
      'message', 'Application approved! Enrollment will sync automatically when the student registers.',
      'enrolled', false
    );
  END IF;

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to both roles to support Universal Admin Access
GRANT EXECUTE ON FUNCTION public.approve_application_final TO anon, authenticated, service_role;
