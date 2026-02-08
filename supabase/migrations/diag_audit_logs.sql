-- DIAGNOSTIC: Audit Logs Schema
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'audit_logs' AND n.nspname = 'public';

-- Check column names
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' AND table_schema = 'public';
