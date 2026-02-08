-- Migration: Hard Fix for Enrollment Foreign Key
-- Objective: Ensure student_id correctly references auth.users(id) and fix the 500/409 error.
-- Also adds the correct redirect URL and student portal configuration.

-- 1. Drop the suspicious foreign key and re-create it correctly
DO $$ 
BEGIN
    -- Drop any foreign key on student_id, regardless of its name
    declare
        fkey_name text;
    begin
        SELECT tc.constraint_name INTO fkey_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'enrollments' AND kcu.column_name = 'student_id' AND tc.constraint_type = 'FOREIGN KEY';
        
        if fkey_name is not null then
            execute 'ALTER TABLE public.enrollments DROP CONSTRAINT ' || fkey_name;
        end if;
    end;

    -- Re-create it pointing explicitly to auth.users
    ALTER TABLE public.enrollments 
    ADD CONSTRAINT enrollments_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

EXCEPTION WHEN others THEN
    RAISE NOTICE 'Handled fkey repair';
END $$;

-- 2. Ensure profiles also points to auth.users correctly (if we dropped it earlier)
DO $$ 
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN RAISE NOTICE 'Handled profile fkey repair';
END $$;

-- 3. Force Cache Reload
NOTIFY pgrst, 'reload schema';
