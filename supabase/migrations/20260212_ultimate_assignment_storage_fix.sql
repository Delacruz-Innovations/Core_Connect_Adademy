-- 1. Ensure the bucket is public to allow direct signed URL generation without session conflict
UPDATE storage.buckets SET public = true WHERE id = 'assignment-submissions';

-- 2. Drop all previous restrictive or conflicting policies
DROP POLICY IF EXISTS "Admins view all submission files" ON storage.objects;
DROP POLICY IF EXISTS "Users view own submission files" ON storage.objects;
DROP POLICY IF EXISTS "Students upload own submissions to storage" ON storage.objects;
DROP POLICY IF EXISTS "Universal Submission Select" ON storage.objects;
DROP POLICY IF EXISTS "Universal Submission Insert" ON storage.objects;
DROP POLICY IF EXISTS "Universal Submission Delete" ON storage.objects;

-- 3. SELECT: Allow broad visibility (needed because Admin Portal auth gate is decommissioned)
-- Security relies on UUID-based folder structure and filenames.
CREATE POLICY "Universal Assignment Select" 
ON storage.objects FOR SELECT 
TO anon, authenticated 
USING (bucket_id = 'assignment-submissions');

-- 4. INSERT: Maintain student upload security (Must be in their own folder)
CREATE POLICY "Universal Assignment Insert" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'assignment-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. DELETE: Maintain safe deletion (Admins only)
CREATE POLICY "Universal Assignment Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'assignment-submissions' 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
