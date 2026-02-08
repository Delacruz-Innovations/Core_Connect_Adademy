-- FINAL APPROVAL FUNCTION (v4)
-- Objective: Universal Anonymous Compatibility.
-- Updated to work even without a session (auth.uid() is null) as per "Universal Admin Access".

CREATE OR REPLACE FUNCTION public.approve_application_final(
    p_application_id uuid,
    p_courses text[],
    p_payment_amount text, 
    p_payment_method text,
    p_payment_status text,
    p_admin_notes text DEFAULT ''
) 
RETURNS jsonb AS $$
DECLARE
    v_student_id uuid;
    v_admin_id uuid;
    v_enrollment_id uuid;
    v_amount numeric;
    v_app_email text;
BEGIN
    -- 1. Resolve Admin ID
    -- If auth.uid() is null (Direct access mode), we use NULL for admin tracking.
    v_admin_id := auth.uid();

    -- 2. Safe Cast Amount
    BEGIN
        v_amount := p_payment_amount::numeric;
    EXCEPTION WHEN OTHERS THEN
        v_amount := 0;
    END;

    -- 3. Get Application Email
    SELECT email INTO v_app_email FROM public.applications WHERE id = p_application_id;
    IF v_app_email IS NULL THEN
        RAISE EXCEPTION 'Application not found with ID %', p_application_id;
    END IF;

    -- 4. Resolve Student ID via Profile email lookup
    -- (The user must have a record in profiles for the enrollment to be meaningful)
    SELECT id INTO v_student_id FROM public.profiles WHERE email = v_app_email LIMIT 1;
    
    -- Fallback: Check if the application itself has a user_id
    IF v_student_id IS NULL THEN
        BEGIN
            EXECUTE 'SELECT user_id FROM public.applications WHERE id = $1' 
            INTO v_student_id USING p_application_id;
        EXCEPTION WHEN OTHERS THEN
            v_student_id := NULL;
        END;
    END IF;

    -- Note: We still need a student identity to create an enrollment.
    -- If no identity found, we cannot enroll.
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'No student identity found for email %. A profile matching this email is required.', v_app_email;
    END IF;

    -- 5. Update Application Status
    UPDATE public.applications
    SET 
        status = 'approved',
        admin_id = v_admin_id,
        approved_at = now()
    WHERE id = p_application_id;

    -- 6. Create Enrollment Record
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
        v_student_id,
        p_application_id,
        v_admin_id,
        p_courses,
        v_amount,
        p_payment_method,
        p_payment_status,
        p_admin_notes,
        'active'
    ) RETURNING id INTO v_enrollment_id;

    RETURN jsonb_build_object(
        'success', true, 
        'enrollment_id', v_enrollment_id,
        'student_id', v_student_id,
        'mode', CASE WHEN v_admin_id IS NULL THEN 'anonymous' ELSE 'authenticated' END
    );

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Approval Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to EVERYONE (including anon) to support Direct Dashboard Access
GRANT EXECUTE ON FUNCTION public.approve_application_final TO anon, authenticated;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
