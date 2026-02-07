-- Migration: Create Course Management Tables
-- New Feature: Courses, Modules, Lessons, and Course Categories
-- Date: 2026-02-07

-- 1. Create Course Categories ENUM
DO $$ BEGIN
    CREATE TYPE public.course_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL, -- URL friendly ID (e.g. 'intro-to-web-dev')
  description text,
  short_description text,
  thumbnail_url text, -- External URL (Cloudinary/Public Link)
  level public.course_level DEFAULT 'Beginner',
  is_published boolean DEFAULT false,
  author_id uuid references auth.users
);

-- 3. Create Modules Table (Chapters)
CREATE TABLE IF NOT EXISTS public.modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  course_id uuid references public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index int DEFAULT 0 -- For ordering modules (1, 2, 3...)
);

-- 4. Create Lessons Table (Content)
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  module_id uuid references public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text DEFAULT 'video', -- 'video', 'article', 'quiz'
  video_url text, -- YouTube/Vimeo Link
  content_text text, -- Rich text content for articles
  duration_minutes int DEFAULT 0,
  order_index int DEFAULT 0, -- For ordering lessons within a module
  is_free_preview boolean DEFAULT false -- Allow non-enrolled users to watch?
);

-- 5. Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Public Access (Read-Only)
-- Anyone can view PUBLISHED courses
CREATE POLICY "Public can view published courses" 
ON public.courses FOR SELECT 
TO anon, authenticated 
USING (is_published = true);

-- Authenticated Users (Read Access)
-- Enrolled students can view modules/lessons
-- (For now, we allow all authenticated users to see structure, 
--  but content access will be gated by Enrollment checks in API/Frontend)
CREATE POLICY "Authenticated users can view modules" 
ON public.modules FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can view lessons" 
ON public.lessons FOR SELECT 
TO authenticated 
USING (true);

-- Admin Access (Full Control)
-- Admins can create, update, delete everything
-- 'service_role' or specific admin check
create policy "Admins can manage courses"
on public.courses
for all
to authenticated
using (
  auth.uid() in (
    select id from public.profiles where role = 'admin'
  )
);

create policy "Admins can manage modules"
on public.modules
for all
to authenticated
using (
  auth.uid() in (
    select id from public.profiles where role = 'admin'
  )
);

create policy "Admins can manage lessons"
on public.lessons
for all
to authenticated
using (
  auth.uid() in (
    select id from public.profiles where role = 'admin'
  )
);

-- 7. Add Indexes for Performance
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_modules_course_id ON public.modules(course_id);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
