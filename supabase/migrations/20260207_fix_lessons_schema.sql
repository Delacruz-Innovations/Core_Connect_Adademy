-- Migration: Fix Lessons Schema
-- Objective: Add missing columns 'description' and 'duration_seconds' to lessons table to match frontend.

-- 1. Add description column
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS description text;

-- 2. Add duration_seconds column
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS duration_seconds int DEFAULT 0;

-- 3. (Optional) Sync duration_minutes to duration_seconds if needed
-- UPDATE public.lessons SET duration_seconds = duration_minutes * 60 WHERE duration_seconds = 0;
