-- 1. STORAGE: Ensure the bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'lms-resources';

-- 2. STORAGE: Create Universal Storage Policies for lms-resources
DROP POLICY IF EXISTS "Admins can manage resource files" ON storage.objects;
DROP POLICY IF EXISTS "Students can download permitted resources" ON storage.objects;
DROP POLICY IF EXISTS "Universal Resources Select" ON storage.objects;
DROP POLICY IF EXISTS "Universal Resources Insert" ON storage.objects;
DROP POLICY IF EXISTS "Universal Resources Update" ON storage.objects;
DROP POLICY IF EXISTS "Universal Resources Delete" ON storage.objects;

CREATE POLICY "Universal Resources Select" ON storage.objects FOR SELECT TO authenticated, anon USING (bucket_id = 'lms-resources');
CREATE POLICY "Universal Resources Insert" ON storage.objects FOR INSERT TO authenticated, anon WITH CHECK (bucket_id = 'lms-resources');
CREATE POLICY "Universal Resources Update" ON storage.objects FOR UPDATE TO authenticated, anon USING (bucket_id = 'lms-resources');
CREATE POLICY "Universal Resources Delete" ON storage.objects FOR DELETE TO authenticated, anon USING (bucket_id = 'lms-resources');

-- 3. DATABASE: Resources Table Universal Access
-- Disabling RLS on 'resources' to match the "Universal Document Access" pattern
ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;

-- 4. DATABASE: Grant permissions to ensure the API can interact with the table
GRANT ALL ON TABLE public.resources TO anon, authenticated, service_role;

-- 5. DATABASE: Safety - Handle potential audit trigger role issues
-- Ensure all columns are nullable if they reference auth.users to allow flexible insertion
ALTER TABLE public.resources ALTER COLUMN created_by DROP NOT NULL;
