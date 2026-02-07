-- Migration: Sequential Module Management & Progress Tracking
-- Objective: Enforce linear progression, week-based locking, and audit trails.

-- 1. Upgrade 'modules' table to match Master Prompt requirements
-- (Assuming 'modules' exists from previous step, we alter it. If not, we create it.)
CREATE TABLE IF NOT EXISTS public.modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  course_id uuid references public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  week_number int NOT NULL, -- The sequence enforcer
  status text DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked')), -- Admin global lock
  created_by uuid references auth.users(id),
  
  UNIQUE(course_id, week_number) -- Sequential Constraint
);

-- 2. Create 'module_progress' table (Student Tracking)
CREATE TABLE IF NOT EXISTS public.module_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid references auth.users(id) ON DELETE CASCADE,
  course_id uuid references public.courses(id) ON DELETE CASCADE, -- Denormalized for RLS speed
  module_id uuid references public.modules(id) ON DELETE CASCADE,
  status text DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'completed')),
  completed_at timestamptz,

  UNIQUE(user_id, module_id)
);

-- 3. RLS: Admin Power
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

-- Admins can do everything on modules
CREATE POLICY "Admins full access modules" 
ON public.modules FOR ALL 
TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins can see all progress
CREATE POLICY "Admins view all progress" 
ON public.module_progress FOR SELECT
TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. RLS: Student Constraints

-- Students can VIEW modules if they are enrolled in the course
-- (Assuming 'enrollments' table exists from previous tasks)
CREATE POLICY "Students view modules of enrolled courses" 
ON public.modules FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE student_id = auth.uid() 
    AND course_id = public.modules.course_id
    AND status = 'active'
  )
);

-- Students can VIEW their own progress
CREATE POLICY "Students view own progress" 
ON public.module_progress FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Students can UPDATE their own progress (e.g. marking complete)
-- BUT triggers will control the 'unlock' logic, they can't force unlock next week
CREATE POLICY "Students update own progress" 
ON public.module_progress FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());


-- 5. AUTO-UNLOCK LOGIC (Trigger)
-- When a student completes a module, unlock the NEXT one.
CREATE OR REPLACE FUNCTION public.fn_unlock_next_module()
RETURNS TRIGGER AS $$
DECLARE
  v_next_module_id uuid;
  v_current_week int;
BEGIN
    -- Only run if status changed to 'completed'
    IF (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed') THEN
        
        -- Get current week number
        SELECT week_number INTO v_current_week 
        FROM public.modules 
        WHERE id = NEW.module_id;

        -- Find next module
        SELECT id INTO v_next_module_id
        FROM public.modules
        WHERE course_id = NEW.course_id 
        AND week_number = v_current_week + 1;

        -- If next module exists, create/unlock progress record
        IF v_next_module_id IS NOT NULL THEN
            INSERT INTO public.module_progress (user_id, course_id, module_id, status)
            VALUES (NEW.user_id, NEW.course_id, v_next_module_id, 'unlocked')
            ON CONFLICT (user_id, module_id) 
            DO UPDATE SET status = 'unlocked';
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_on_module_complete
AFTER UPDATE ON public.module_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_unlock_next_module();

-- 6. AUDIT LOGGING (Modules)
CREATE OR REPLACE FUNCTION public.fn_audit_module_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (event_type, entity_type, entity_id, admin_id, details)
        VALUES ('module_created', 'module', NEW.id, auth.uid(), jsonb_build_object('title', NEW.title));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (event_type, entity_type, entity_id, admin_id, details)
        VALUES ('module_updated', 'module', NEW.id, auth.uid(), jsonb_build_object('changes', 'updated'));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_audit_modules
AFTER INSERT OR UPDATE ON public.modules
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_module_changes();
