-- 1. Create Universal Storage Policies for assignment-submissions
-- This unblocks the Admin Portal from generating signed URLs
DROP POLICY IF EXISTS "Admins view all submission files" ON storage.objects;
DROP POLICY IF EXISTS "Users view own submission files" ON storage.objects;
DROP POLICY IF EXISTS "Students upload own submissions to storage" ON storage.objects;
DROP POLICY IF EXISTS "Universal Submission Select" ON storage.objects;
DROP POLICY IF EXISTS "Universal Submission Insert" ON storage.objects;
DROP POLICY IF EXISTS "Universal Submission Delete" ON storage.objects;

-- SELECT: Allow authenticated users (Admins & Students) to select objects
CREATE POLICY "Universal Submission Select" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'assignment-submissions');

-- INSERT: Maintain student upload logic (folder must match their user ID)
CREATE POLICY "Universal Submission Insert" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'assignment-submissions' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Maintain admin-only deletion
CREATE POLICY "Universal Submission Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'assignment-submissions' AND (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
));
