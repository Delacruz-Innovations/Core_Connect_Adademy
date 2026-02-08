-- DIAGNOSTIC: List all triggers on auth.users
-- Objective: Find the exact name of the trigger causing the 500 error.

SELECT 
    tgname AS trigger_name,
    relname AS table_name,
    nspname AS schema_name
FROM pg_trigger
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE relname = 'users' AND nspname = 'auth';
