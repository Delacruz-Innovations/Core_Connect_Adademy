-- CHECK CURRENT APPLICATIONS
-- This helps us see if the data is actually in the database or if it's missing.
SELECT id, full_name, email, status, created_at 
FROM public.applications
ORDER BY created_at DESC;

-- Also check leads for comparison
SELECT id, first_name, last_name, email, status, created_at 
FROM public.leads
ORDER BY created_at DESC;
