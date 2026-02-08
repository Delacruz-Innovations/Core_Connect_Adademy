-- Migration: Universal Storage Access
-- Objective: Open up the 'lesson-videos' storage bucket for direct access without authentication.
-- Rationale: Supporting "Direct Dashboard Access" by bypassing storage RLS.

-- 1. Ensure the bucket is public (optional, but good for direct links if needed)
UPDATE storage.buckets SET public = true WHERE id = 'lesson-videos';

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins manage lesson videos" ON storage.objects;

-- 3. Create Universal Storage Policies
-- Allow anyone (anon or authenticated) to SELECT, INSERT, UPDATE, and DELETE in the 'lesson-videos' bucket.
CREATE POLICY "Universal Select Permission" 
ON storage.objects FOR SELECT 
TO anon, authenticated 
USING (bucket_id = 'lesson-videos');

CREATE POLICY "Universal Insert Permission" 
ON storage.objects FOR INSERT 
TO anon, authenticated 
WITH CHECK (bucket_id = 'lesson-videos');

CREATE POLICY "Universal Update Permission" 
ON storage.objects FOR UPDATE 
TO anon, authenticated 
USING (bucket_id = 'lesson-videos');

CREATE POLICY "Universal Delete Permission" 
ON storage.objects FOR DELETE 
TO anon, authenticated 
USING (bucket_id = 'lesson-videos');

-- 4. Lessons Table - Safety for created_by
-- Allow created_by to be NULL for direct access entries.
ALTER TABLE public.lessons ALTER COLUMN created_by DROP NOT NULL;
