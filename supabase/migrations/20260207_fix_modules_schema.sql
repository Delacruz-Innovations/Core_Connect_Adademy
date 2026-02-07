-- Migration: Fix Modules Schema
-- Objective: Add missing columns 'week_number' and 'status' to modules table to match frontend expectations.

-- 1. Add week_number column
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS week_number int DEFAULT 1;

-- 2. Add status column
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'completed'));

-- 3. Copy order_index to week_number if it exists and week_number is default
-- (If order_index was used previously)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modules' AND column_name = 'order_index') THEN
        UPDATE public.modules SET week_number = order_index WHERE order_index > 0;
    END IF;
END $$;

-- 4. Create Index on week_number for sorting
CREATE INDEX IF NOT EXISTS idx_modules_week_number ON public.modules(week_number);
