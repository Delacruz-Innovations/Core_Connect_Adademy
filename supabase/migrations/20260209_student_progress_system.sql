-- 🧠 MASTER MIGRATION: COMPLETE STUDENT PROGRESS TRACKING SYSTEM
-- (PART 1 - ENTITIES, PART 2 - LESSONS, PART 3 - MODULES, PART 4 - COURSE, PART 8 - AUDIT)

-- 1. Progress Entities Expansion
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_progress') THEN
        CREATE TABLE public.course_progress (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
            status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
            completed_at timestamptz,
            
            UNIQUE(user_id, course_id)
        );
    END IF;
END $$;

-- Denormalize course_id into lesson_progress for performance (already exists in some migrations, ensuring here)
DO $$ BEGIN
    ALTER TABLE public.lesson_progress ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id);
    ALTER TABLE public.lesson_progress ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES public.modules(id);
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- 2. Audit Logging Standardization (PART 8)
CREATE OR REPLACE FUNCTION public.fn_log_progress_event()
RETURNS TRIGGER AS $$
DECLARE
    v_action text;
    v_entity_type text;
    v_actor_role text;
BEGIN
    v_actor_role := public.get_actor_role(auth.uid());
    
    -- Determine entity type and action
    IF TG_TABLE_NAME = 'lesson_progress' THEN
        v_entity_type := 'lesson';
        IF NEW.is_completed AND NOT OLD.is_completed THEN v_action := 'lesson_completed'; END IF;
    ELSIF TG_TABLE_NAME = 'module_progress' THEN
        v_entity_type := 'module';
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN v_action := 'module_completed'; END IF;
    ELSIF TG_TABLE_NAME = 'course_progress' THEN
        v_entity_type := 'course';
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN v_action := 'course_completed'; END IF;
    END IF;

    -- Only log if a completion event occurred
    IF v_action IS NOT NULL THEN
        INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
        VALUES (
            auth.uid(),
            COALESCE(v_actor_role, 'student'),
            v_action,
            v_entity_type,
            CASE 
                WHEN v_entity_type = 'lesson' THEN NEW.lesson_id::text
                WHEN v_entity_type = 'module' THEN NEW.module_id::text
                WHEN v_entity_type = 'course' THEN NEW.course_id::text
            END,
            jsonb_build_object(
                'completed_at', now(),
                'user_id', NEW.user_id
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Lesson Progress Gating (PART 2)
CREATE OR REPLACE FUNCTION public.fn_enforce_lesson_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Calculate percentage accurately
    IF NEW.total_duration > 0 THEN
        NEW.percent_watched := LEAST(100, (NEW.watched_seconds * 100) / NEW.total_duration);
    END IF;

    -- 2. Enforce 90% threshold for completion (Deterministic)
    -- Student cannot manually set is_completed = true if percentage < 90
    IF NEW.percent_watched >= 90 AND NOT OLD.is_completed THEN
        NEW.is_completed := true;
        NEW.completed_at := now();
    ELSIF NEW.percent_watched < 90 AND NOT public.check_is_admin() THEN
        -- Revert if student tries to spoof completion
        NEW.is_completed := false;
        NEW.completed_at := NULL;
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_lesson_progress_enforcement ON public.lesson_progress;
CREATE TRIGGER tr_lesson_progress_enforcement
BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_lesson_completion();

DROP TRIGGER IF EXISTS tr_audit_lesson_completion ON public.lesson_progress;
CREATE TRIGGER tr_audit_lesson_completion
AFTER UPDATE ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_log_progress_event();

-- 4. Module Progress Gating (PART 3)
-- Enhanced can_complete_module (Deterministic check)
CREATE OR REPLACE FUNCTION public.check_module_completion_requirements(p_user_id uuid, p_module_id uuid)
RETURNS boolean AS $$
DECLARE
    v_lessons_count int;
    v_completed_lessons_count int;
    v_assignment_required boolean;
    v_assignment_submitted boolean;
BEGIN
    -- Check lessons
    SELECT COUNT(*) INTO v_lessons_count FROM public.lessons WHERE module_id = p_module_id;
    SELECT COUNT(*) INTO v_completed_lessons_count FROM public.lesson_progress 
    WHERE module_id = p_module_id AND user_id = p_user_id AND is_completed = true;
    
    IF v_completed_lessons_count < v_lessons_count THEN
        RETURN false;
    END IF;

    -- Check assignment
    SELECT submission_required INTO v_assignment_required FROM public.assignments WHERE module_id = p_module_id;
    IF v_assignment_required THEN
        SELECT EXISTS (
            SELECT 1 FROM public.assignment_submissions sub
            JOIN public.assignments a ON a.id = sub.assignment_id
            WHERE a.module_id = p_module_id AND sub.user_id = p_user_id
        ) INTO v_assignment_submitted;
        
        IF NOT v_assignment_submitted THEN
            RETURN false;
        END IF;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check for module completion when a lesson is finished
CREATE OR REPLACE FUNCTION public.fn_auto_check_module_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_can_complete boolean;
BEGIN
    -- Only check if lesson was just completed
    IF NEW.is_completed AND NOT OLD.is_completed THEN
        v_can_complete := public.check_module_completion_requirements(NEW.user_id, NEW.module_id);
        
        IF v_can_complete THEN
            INSERT INTO public.module_progress (user_id, course_id, module_id, status, completed_at)
            VALUES (NEW.user_id, NEW.course_id, NEW.module_id, 'completed', now())
            ON CONFLICT (user_id, module_id) 
            DO UPDATE SET status = 'completed', completed_at = now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_module_on_lesson_complete ON public.lesson_progress;
CREATE TRIGGER tr_check_module_on_lesson_complete
AFTER UPDATE ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_check_module_completion();

-- Also check on assignment submission
CREATE OR REPLACE FUNCTION public.fn_auto_check_module_completion_on_assignment()
RETURNS TRIGGER AS $$
DECLARE
    v_module_id uuid;
    v_course_id uuid;
    v_can_complete boolean;
BEGIN
    SELECT module_id, course_id INTO v_module_id, v_course_id 
    FROM public.assignments WHERE id = NEW.assignment_id;

    v_can_complete := public.check_module_completion_requirements(NEW.user_id, v_module_id);
    
    IF v_can_complete THEN
        INSERT INTO public.module_progress (user_id, course_id, module_id, status, completed_at)
        VALUES (NEW.user_id, v_course_id, v_module_id, 'completed', now())
        ON CONFLICT (user_id, module_id) 
        DO UPDATE SET status = 'completed', completed_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_module_on_assignment_submission ON public.assignment_submissions;
CREATE TRIGGER tr_check_module_on_assignment_submission
AFTER INSERT ON public.assignment_submissions
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_check_module_completion_on_assignment();

DROP TRIGGER IF EXISTS tr_audit_module_completion ON public.module_progress;
CREATE TRIGGER tr_audit_module_completion
AFTER UPDATE ON public.module_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_log_progress_event();

-- Trigger for Next Module Unlocking (already in sequential_logic migration, but ensuring it's here and correct)
-- fn_unlock_next_module already exists, we leave it as it works on module_progress status = 'completed'.

-- 5. Course Progress Gating (PART 4)
CREATE OR REPLACE FUNCTION public.fn_check_course_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_modules_count int;
    v_completed_modules_count int;
BEGIN
    -- Only run if a module was just completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        SELECT COUNT(*) INTO v_modules_count FROM public.modules WHERE course_id = NEW.course_id;
        SELECT COUNT(*) INTO v_completed_modules_count FROM public.module_progress 
        WHERE course_id = NEW.course_id AND user_id = NEW.user_id AND status = 'completed';
        
        IF v_completed_modules_count >= v_modules_count THEN
            INSERT INTO public.course_progress (user_id, course_id, status, completed_at)
            VALUES (NEW.user_id, NEW.course_id, 'completed', now())
            ON CONFLICT (user_id, course_id) 
            DO UPDATE SET status = 'completed', completed_at = now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_course_on_module_complete ON public.module_progress;
CREATE TRIGGER tr_check_course_on_module_complete
AFTER UPDATE ON public.module_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_check_course_completion();

DROP TRIGGER IF EXISTS tr_audit_course_completion ON public.course_progress;
CREATE TRIGGER tr_audit_course_completion
AFTER UPDATE ON public.course_progress
FOR EACH ROW EXECUTE FUNCTION public.fn_log_progress_event();

-- 6. Admin Override RPC (PART 6)
CREATE OR REPLACE FUNCTION public.admin_override_progress(
    p_user_id uuid,
    p_entity_type text, -- 'lesson', 'module', 'course'
    p_entity_id uuid,
    p_status text, -- 'completed', 'in_progress', 'unlocked'
    p_reason text
)
RETURNS void AS $$
BEGIN
    -- 1. Authorization check
    IF NOT public.check_is_admin() THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Progress override restricted to administrators.';
    END IF;

    -- 2. Execute Override
    IF p_entity_type = 'lesson' THEN
        INSERT INTO public.lesson_progress (user_id, lesson_id, is_completed, completed_at, percent_watched)
        VALUES (p_user_id, p_entity_id, (p_status = 'completed'), CASE WHEN p_status = 'completed' THEN now() ELSE NULL END, CASE WHEN p_status = 'completed' THEN 100 ELSE 0 END)
        ON CONFLICT (user_id, lesson_id) 
        DO UPDATE SET is_completed = (p_status = 'completed'), completed_at = CASE WHEN p_status = 'completed' THEN now() ELSE NULL END, percent_watched = CASE WHEN p_status = 'completed' THEN 100 ELSE lesson_progress.percent_watched END;
    
    ELSIF p_entity_type = 'module' THEN
        INSERT INTO public.module_progress (user_id, module_id, status, completed_at)
        VALUES (p_user_id, p_entity_id, p_status, CASE WHEN p_status = 'completed' THEN now() ELSE NULL END)
        ON CONFLICT (user_id, module_id) 
        DO UPDATE SET status = p_status, completed_at = CASE WHEN p_status = 'completed' THEN now() ELSE NULL END;
        
    ELSIF p_entity_type = 'course' THEN
        INSERT INTO public.course_progress (user_id, course_id, status, completed_at)
        VALUES (p_user_id, p_entity_id, p_status, CASE WHEN p_status = 'completed' THEN now() ELSE NULL END)
        ON CONFLICT (user_id, course_id) 
        DO UPDATE SET status = p_status, completed_at = CASE WHEN p_status = 'completed' THEN now() ELSE NULL END;
    
    ELSE
        RAISE EXCEPTION 'INVALID_ENTITY: Entity type % not supported.', p_entity_type;
    END IF;

    -- 3. Log Absolute Traceability
    INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    VALUES (
        auth.uid(),
        'admin',
        'progress_overridden',
        p_entity_type,
        p_entity_id::text,
        jsonb_build_object(
            'target_user_id', p_user_id,
            'new_status', p_status,
            'reason', p_reason
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Progress Locking & Access Control (PART 7)
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own course progress" ON public.course_progress;
CREATE POLICY "Students view own course progress"
ON public.course_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all course progress" ON public.course_progress;
CREATE POLICY "Admins view all course progress"
ON public.course_progress FOR SELECT
TO authenticated
USING (public.check_is_admin());

-- Ensure Admin God Policy for inserts/updates
DROP POLICY IF EXISTS "Admin God Policy" ON public.course_progress;
CREATE POLICY "Admin God Policy" ON public.course_progress FOR ALL 
TO authenticated 
USING (public.check_is_admin()) 
WITH CHECK (public.check_is_admin());

-- Additional Safeguard: Students can only read lessons of modules they have at least 'unlocked'
-- We modify existing lessons policy or add a check in the student portal view.
-- RLS check for lessons: 
DROP POLICY IF EXISTS "Students view lessons of unlocked modules" ON public.lessons;
CREATE POLICY "Students view lessons of unlocked modules"
ON public.lessons FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.module_progress mp
        WHERE mp.module_id = public.lessons.module_id
        AND mp.user_id = auth.uid()
        AND mp.status IN ('unlocked', 'completed')
    )
    OR public.check_is_admin()
);
