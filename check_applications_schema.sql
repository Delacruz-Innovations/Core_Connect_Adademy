-- Quick diagnostic query to see the actual columns in applications table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'applications'
ORDER BY ordinal_position;
