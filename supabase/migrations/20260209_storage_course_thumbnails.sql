-- Create a bucket for course thumbnails if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the bucket
-- Allow public access to read thumbnails
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'course-thumbnails' );

-- Allow authenticated users to upload thumbnails
CREATE POLICY "Authenticated Users Can Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'course-thumbnails' );

-- Allow authenticated users to update their thumbnails
CREATE POLICY "Authenticated Users Can Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'course-thumbnails' );

-- Allow authenticated users to delete thumbnails
CREATE POLICY "Authenticated Users Can Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'course-thumbnails' );
