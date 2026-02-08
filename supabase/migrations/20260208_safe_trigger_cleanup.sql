-- REPAIR: Safe Auth Trigger Cleanup
-- Objective: Dropping ONLY user-defined triggers on auth.users, preserving internal system constraints.

DO $$ 
DECLARE
    trig_record RECORD;
BEGIN
    FOR trig_record IN (
        SELECT tgname 
        FROM pg_trigger 
        JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid 
        JOIN pg_namespace ON pg_class.relnamespace = nsp.oid 
        WHERE pg_class.relname = 'users' 
        AND pg_namespace.nspname = 'auth' 
        AND tgisinternal = false -- THIS IS THE CRITICAL FIX: Skip system triggers
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trig_record.tgname) || ' ON auth.users';
    END LOOP;
END $$;

-- Also check and drop the specific trigger we know about if it exists
DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Final Reload
NOTIFY pgrst, 'reload schema';
