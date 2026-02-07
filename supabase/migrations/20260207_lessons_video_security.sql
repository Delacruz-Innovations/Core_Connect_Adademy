-- Migration: Secure Lesson Management & Video Progress
-- Objective: Enforce private video storage, signed URL access, and granular progress tracking.

-- 1. Upgrade 'lessons' table
-- We alter the existing table to support private storage paths instead of public URLs
ALTER TABLE public.lessons 
  ADD COLUMN IF NOT EXISTS video_path text, -- Path in 'lesson-videos' bucket
  ADD COLUMN IF NOT EXISTS created_by uuid references auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Create 'lesson_progress' table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid references auth.users(id) ON DELETE CASCADE,
  course_id uuid references public.courses(id) ON DELETE CASCADE,
  module_id uuid references public.modules(id) ON DELETE CASCADE,
  lesson_id uuid references public.lessons(id) ON DELETE CASCADE,
  
  watched_seconds int DEFAULT 0,
  total_duration int DEFAULT 0, -- Snapshot of duration to calculate %
  percent_watched int DEFAULT 0,
  is_completed boolean DEFAULT false,
  last_position_seconds int DEFAULT 0,
  
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,

  UNIQUE(user_id, lesson_id)
);

-- 3. STORAGE: Create Private Bucket for Videos
-- Note: Buckets are usually created via API/Dashboard, but we can try SQL extension if available.
-- Otherwise, RLS policies below assume the bucket 'lesson-videos' exists.
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-videos', 'lesson-videos', false)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS for Storage (Strict!)
-- Admin: Full Access
CREATE POLICY "Admins manage lesson videos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'lesson-videos' 
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Students: READ ONLY (Signed URLs bypass RLS in logic, but standard SELECT needs permission if not signed)
-- Actually, for Signed URLs, we don't need a SELECT policy for anon/authenticated if using the `storage.api`.
-- But if we use the JS SDK `download`, we might. 
-- The Master Prompt says "Signed URLs must be time-bound". 
-- Supabase `createSignedUrl` works even on private buckets without RLS for the user, 
-- AS LONG AS the creator (Admin) has permission? No, the reader needs permission OR a signed token.
-- We will rely on Server-Side Signed URL generation (by Admin/Edge Function) OR 
-- simply allow "Authenticated Enrolled Students" to read.
-- Master prompt says "Backend generates SIGNED URLs". So we keep it private.

-- 5. RLS for Progress
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all lesson progress"
ON public.lesson_progress FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Students view own lesson progress"
ON public.lesson_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Students update own lesson progress"
ON public.lesson_progress FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Students insert own lesson progress"
ON public.lesson_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());


-- 6. AUDIT LOGGING (Lessons)
CREATE OR REPLACE FUNCTION public.fn_audit_lesson_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (event_type, entity_type, entity_id, admin_id, details)
        VALUES ('lesson_created', 'lesson', NEW.id, auth.uid(), jsonb_build_object('title', NEW.title));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Check if video changed
        IF (OLD.video_path IS DISTINCT FROM NEW.video_path) THEN
             INSERT INTO public.audit_logs (event_type, entity_type, entity_id, admin_id, details)
             VALUES ('video_uploaded', 'lesson', NEW.id, auth.uid(), jsonb_build_object('path', NEW.video_path));
        ELSE
             INSERT INTO public.audit_logs (event_type, entity_type, entity_id, admin_id, details)
             VALUES ('lesson_updated', 'lesson', NEW.id, auth.uid(), jsonb_build_object('changes', 'metadata'));
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_audit_lessons
AFTER INSERT OR UPDATE ON public.lessons
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_lesson_changes();


-- 7. PROGRESS COMPLETION LOGIC (Trigger)
-- If percent_watched >= 90, mark completed.
CREATE OR REPLACE FUNCTION public.fn_check_lesson_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Check 90% threshold
    IF (NEW.percent_watched >= 90 AND OLD.is_completed = false) THEN
        NEW.is_completed := true;
        NEW.completed_at := now();
        
        -- Optional: Log completion?
        -- We can just rely on the record existence.
    END IF;
    
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_lesson_progress_check
BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_check_lesson_completion();
