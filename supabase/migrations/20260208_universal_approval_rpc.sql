-- UNIVERSAL APPROVAL FUNCTION
-- Objective: Create a robust, type-safe function with a NEW NAME to bypass any caching issues.
-- We use 'text' for the amount to avoid JS-to-Postgres numeric signature mismatches.

CREATE OR REPLACE FUNCTION public.approve_application_universal(
    p_application_id uuid,
    p_admin_id uuid,
    p_courses text[], -- JS Array ["A", "B"] maps to text[]
    p_payment_amount text, -- Pass as string "150.00" to be safe
    p_payment_method text,
    p_payment_status text,
    p_admin_notes text DEFAULT ''
) 
RETURNS jsonb AS $$
DECLARE
    v_user_id uuid;
    v_enrollment_id uuid;
    v_amount numeric;
BEGIN
    -- 1. Safe Cast Amount
    BEGIN
        v_amount := p_payment_amount::numeric;
    EXCEPTION WHEN OTHERS THEN
        v_amount := 0;
    END;

    -- 2. Get User ID
    SELECT user_id INTO v_user_id FROM public.applications WHERE id = p_application_id;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Application not found or has no user_id';
    END IF;

    -- 3. Update Application
    UPDATE public.applications
    SET 
        status = 'approved',
        admin_id = p_admin_id,
        approved_at = now()
    WHERE id = p_application_id;

    -- 4. Create Enrollment
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
        v_amount,
        p_payment_method,
        p_payment_status,
        p_admin_notes,
        'active'
    ) RETURNING id INTO v_enrollment_id;

    RETURN jsonb_build_object('success', true, 'enrollment_id', v_enrollment_id);

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in approve_application_universal: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.approve_application_universal TO authenticated;

NOTIFY pgrst, 'reload schema';
