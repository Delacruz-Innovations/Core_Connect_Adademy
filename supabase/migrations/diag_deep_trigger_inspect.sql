-- FINDING THE ROGUE TRIGGER
-- Objective: List all triggers on auth.users and the EXACT functions they call.
-- Knowing the function name will allow us to DROP it even if the trigger name is weird.

SELECT 
    trig.tgname AS trigger_name,
    func.proname AS function_name,
    nsp.nspname AS trigger_schema,
    fn_nsp.nspname AS function_schema
FROM pg_trigger trig
JOIN pg_class tbl ON trig.tgrelid = tbl.oid
JOIN pg_proc func ON trig.tgfoid = func.oid
JOIN pg_namespace nsp ON tbl.relnamespace = nsp.oid
JOIN pg_namespace fn_nsp ON func.pronamespace = fn_nsp.oid
WHERE tbl.relname = 'users' AND nsp.nspname = 'auth';

-- Also check profiles table for any failing constraints or indexes
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles';
