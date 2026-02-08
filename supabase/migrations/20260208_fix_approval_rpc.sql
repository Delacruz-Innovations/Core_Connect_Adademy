-- EMERGENCY FIX: approve_application_v2 Function
-- Objective: Ensure function signature EXACTLY matches the frontend call

-- Drop ALL variations of this function to avoid overload ambiguity
DROP FUNCTION IF EXISTS public.approve_application_v2(uuid, uuid, text[], decimal, text, text, text);
DROP FUNCTION IF EXISTS public.approve_application_v2(uuid, uuid, text[], numeric, text, text, text);

-- Re-create with generic types where possible to be forgiving
CREATE OR REPLACE FUNCTION public.approve_application_v2(
    p_application_id uuid,
    p_admin_id uuid,
    p_courses text[],
    p_payment_amount numeric, -- Use numeric instead of decimal (postgres preference)
    p_payment_method text,
    p_payment_status text,
    p_admin_notes text DEFAULT NULL
) 
RETURNS jsonb AS $$
DECLARE
    v_user_id uuid;
    v_enrollment_id uuid;
BEGIN
    -- 1. Get User ID from Application
    SELECT user_id INTO v_user_id FROM public.applications WHERE id = p_application_id;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Application not found or has no user_id';
    END IF;

    -- 2. Update Application Status
    UPDATE public.applications
    SET 
        status = 'approved',
        admin_id = p_admin_id,
        approved_at = now()
    WHERE id = p_application_id;

    -- 3. Create Enrollment Record
    INSERT INTO public.enrollments (
        student_id,
        application_id,
        admin_id,
        courses,
        payment_amount,
        payment_method,
        payment_status,
        admin_notes,
        status
    ) VALUES (
        v_user_id,
        p_application_id,
        p_admin_id,
        p_courses,
        p_payment_amount,
        p_payment_method,
        p_payment_status,
        p_admin_notes,
        'active'
    ) RETURNING id INTO v_enrollment_id;

    RETURN jsonb_build_object('success', true, 'enrollment_id', v_enrollment_id);

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in approve_application_v2: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.approve_application_v2 TO authenticated;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
