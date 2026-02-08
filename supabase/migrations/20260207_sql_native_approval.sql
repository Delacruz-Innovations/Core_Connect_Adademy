-- Migration: SQL-Native Approval Workflow
-- Objective: Automate student onboarding via Database RPC (The Edge Function Alternative)

-- 1. Create the base trigger function (for auditing)
CREATE OR REPLACE FUNCTION public.fn_on_application_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved')) THEN
        -- Create Audit Log
        INSERT INTO public.audit_logs (
            event_type,
            entity_type,
            entity_id,
            admin_id,
            details
        ) VALUES (
            'application_approved_sql',
            'application',
            NEW.id,
            NEW.admin_id,
            jsonb_build_object(
                'full_name', NEW.full_name,
                'email', NEW.email,
                'program', NEW.program_name
            )
        );
        NEW.approved_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the trigger
DROP TRIGGER IF EXISTS tr_on_approval_logic ON public.applications;
CREATE TRIGGER tr_on_approval_logic
BEFORE UPDATE ON public.applications
FOR EACH ROW
WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
EXECUTE FUNCTION public.fn_on_application_approval();

-- 3. The "RPC Alternative" - A single, atomic call to handle the entire approval process
-- This is much faster and more reliable than frontend-side multiple updates
CREATE OR REPLACE FUNCTION public.approve_application_v2(
    p_application_id uuid,
    p_admin_id uuid,
    p_courses text[],
    p_payment_amount decimal,
    p_payment_method text,
    p_payment_status text,
    p_admin_notes text DEFAULT NULL
) 
RETURNS boolean AS $$
BEGIN
    -- A. Update Application Status
    UPDATE public.applications
    SET 
        status = 'approved',
        admin_id = p_admin_id,
        approved_at = now()
    WHERE id = p_application_id;

    -- B. Create the Enrollment Record
    INSERT INTO public.enrollments (
        application_id,
        admin_id,
        courses,
        payment_amount,
        payment_method,
        payment_status,
        admin_notes,
        status
    ) VALUES (
        p_application_id,
        p_admin_id,
        p_courses,
        p_payment_amount,
        p_payment_method,
        p_payment_status,
        p_admin_notes,
        'active'
    );

    -- C. Return true to signal success
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in approve_application: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.approve_application_v2 IS 'Handles application approval and enrollment in a single atomic database call.';
