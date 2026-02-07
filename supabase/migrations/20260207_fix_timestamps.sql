-- Migration: Fix Missing Timestamps
-- Objective: Add 'updated_at' column to 'modules' table if missing.

-- 1. Add updated_at to modules
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Add updated_at to lessons (just in case)
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
