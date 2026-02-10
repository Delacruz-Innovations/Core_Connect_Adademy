-- Expand Application Status ENUM and Add Lead Notes
-- This migration adds more granular stages to the lead pipeline.

-- 1. Add new values to application_status ENUM
-- Note: Postgres 12+ supports ALTER TYPE ... ADD VALUE.
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'captured';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'contacted';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'qualified';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'disqualified';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'nurturing';

-- 2. Add lead_notes column to track engagement history
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS lead_notes jsonb DEFAULT '[]'::jsonb;

-- 3. Notify schema reload
NOTIFY pgrst, 'reload schema';
