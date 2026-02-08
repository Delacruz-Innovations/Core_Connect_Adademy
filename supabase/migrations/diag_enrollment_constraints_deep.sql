-- DIAGNOSTIC: Deep Inspection of enrollments constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'enrollments' AND n.nspname = 'public';

-- Check if a 'users' table exists in the public schema
SELECT tablename, tableowner 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';
