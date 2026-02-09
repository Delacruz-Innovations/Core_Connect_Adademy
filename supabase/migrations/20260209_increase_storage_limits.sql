-- Migration: Increase Storage Limit for Lesson Videos
-- Objective: Allow larger video uploads (up to 500MB) for course content.

UPDATE storage.buckets
SET file_size_limit = 524288000 -- 500MB in bytes
WHERE id = 'lesson-videos';

-- Also ensure 'documents' and 'course-thumbnails' have reasonable limits
UPDATE storage.buckets
SET file_size_limit = 52428800 -- 50MB
WHERE id IN ('documents', 'course-thumbnails');
