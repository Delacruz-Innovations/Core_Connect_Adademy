-- DIAGNOSTIC: Check for all UPDATE triggers on auth.users and public.profiles
SELECT 
    tgname as trigger_name,
    relname as table_name,
    nspname as schema_name,
    tgtype,
    CASE 
        WHEN (tgtype & 16) = 16 THEN 'UPDATE'
        WHEN (tgtype & 4) = 4 THEN 'INSERT'
        WHEN (tgtype & 8) = 8 THEN 'DELETE'
    END as event_type,
    tgisinternal
FROM pg_trigger 
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid 
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid 
WHERE pg_class.relname IN ('users', 'profiles')
AND pg_namespace.nspname IN ('auth', 'public')
ORDER BY schema_name, table_name;
