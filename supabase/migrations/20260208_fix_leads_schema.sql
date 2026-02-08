-- EMERGENCY FIX: leads Table Schema
-- Run this script to completely reset the 'leads' table and force a schema cache reload.
-- CAUTION: This will delete existing data in the 'leads' table.

-- 1. Drop existing table to ensure clean slate
DROP TABLE IF EXISTS public.leads CASCADE;

-- 2. Re-create the table with exact columns expected by Frontend
CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    course_interest text,
    notes text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
    notified_at timestamptz
);

-- 3. Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Re-create Policies
CREATE POLICY "Enable insert for anon (applicants)" 
ON public.leads FOR INSERT TO anon 
WITH CHECK (true);

CREATE POLICY "Admins can manage leads" 
ON public.leads FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 5. Force Schema Cache Reload (Critical for 'column not found' errors)
NOTIFY pgrst, 'reload schema';
