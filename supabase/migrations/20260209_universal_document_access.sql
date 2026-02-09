-- Migration: Universal Document Storage Access
-- Objective: Open up the 'course-documents' storage bucket for direct access without authentication.
-- Rationale: Supporting "Direct Dashboard Access" by bypassing storage RLS.

-- 1. Ensure the bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'course-documents';

-- 2. Drop existing restrictive policies from the original migration
DROP POLICY IF EXISTS "Admins can manage document files" ON storage.objects;
DROP POLICY IF EXISTS "Students can download published documents" ON storage.objects;

-- 3. Create Universal Storage Policies for documents
DROP POLICY IF EXISTS "Universal Document Select Permission" ON storage.objects;
CREATE POLICY "Universal Document Select Permission" 
ON storage.objects FOR SELECT 
TO anon, authenticated 
USING (bucket_id = 'course-documents');

DROP POLICY IF EXISTS "Universal Document Insert Permission" ON storage.objects;
CREATE POLICY "Universal Document Insert Permission" 
ON storage.objects FOR INSERT 
TO anon, authenticated 
WITH CHECK (bucket_id = 'course-documents');

DROP POLICY IF EXISTS "Universal Document Update Permission" ON storage.objects;
CREATE POLICY "Universal Document Update Permission" 
ON storage.objects FOR UPDATE 
TO anon, authenticated 
USING (bucket_id = 'course-documents');

DROP POLICY IF EXISTS "Universal Document Delete Permission" ON storage.objects;
CREATE POLICY "Universal Document Delete Permission" 
ON storage.objects FOR DELETE 
TO anon, authenticated 
USING (bucket_id = 'course-documents');

-- 4. Documents Table - Unrestricted Access
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.documents TO anon, authenticated, service_role;

-- 5. Safety for created_by
ALTER TABLE public.documents ALTER COLUMN created_by DROP NOT NULL;
