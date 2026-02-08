-- DIAGNOSTIC: List ALL triggers on auth.users and public.profiles
SELECT 
    event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_name,
    action_statement as function_call,
    action_timing as timing,
    event_manipulation as event
FROM information_schema.triggers
WHERE event_object_table IN ('users', 'profiles')
ORDER BY table_name, timing;
