-- Migration: Add Marketing Content Columns to Courses
-- Date: 2026-02-09

ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS duration text,
ADD COLUMN IF NOT EXISTS prerequisites text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS learning_outcomes text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_audience text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS career_prospects text[] DEFAULT '{}';

-- Add comments for clarity
COMMENT ON COLUMN public.courses.learning_outcomes IS 'Array of strings for "What You Will Master" section';
COMMENT ON COLUMN public.courses.target_audience IS 'Array of strings for "Who Should Enroll" section';
COMMENT ON COLUMN public.courses.career_prospects IS 'Array of strings for "Transform Your Career" section';
