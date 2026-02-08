-- DIAGNOSTIC: Check for ON UPDATE triggers on auth.users
SELECT 
    tgname AS trigger_name,
    proname AS function_name,
    tgenabled AS is_enabled,
    CASE 
        WHEN (tgtype & 2) = 2 THEN 'BEFORE'
        WHEN (tgtype & 2) = 0 THEN 'AFTER'
    END AS timing,
    CASE 
        WHEN (tgtype & 4) = 4 THEN 'INSERT'
        WHEN (tgtype & 8) = 8 THEN 'DELETE'
        WHEN (tgtype & 16) = 16 THEN 'UPDATE'
        WHEN (tgtype & 32) = 32 THEN 'SELECT'
    END AS event
FROM pg_trigger
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE pg_class.relname = 'users' 
AND pg_namespace.nspname = 'auth'
AND (tgtype & 16) = 16; -- Only UPDATE events
