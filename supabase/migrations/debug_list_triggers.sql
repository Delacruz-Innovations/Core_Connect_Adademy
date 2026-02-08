-- EMERGENCY DEBUG: Get all triggers
SELECT 
    event_object_table AS table_name, 
    trigger_name, 
    action_statement AS action,
    event_manipulation AS event,
    action_timing AS timing
FROM information_schema.triggers
WHERE event_object_schema = 'public' OR event_object_schema = 'auth';
