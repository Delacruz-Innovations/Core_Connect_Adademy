-- 📊 ADMIN ANALYTICS RPCs
-- Designed to power the admin analytics dashboard with granular student tracking

-- 1. Get Course Students with Progress Overview
CREATE OR REPLACE FUNCTION public.get_course_students_progress(
    p_course_id uuid
)
RETURNS TABLE (
    student_id uuid,
    full_name text,
    email text,
    avatar_url text,
    enrolled_at timestamptz,
    completed_lessons bigint,
    total_lessons bigint,
    progress_percent int,
    last_active_at timestamptz,
    current_module_title text
) AS $$
BEGIN
    RETURN QUERY
    WITH course_stats AS (      
        SELECT count(l.id) as total 
        FROM public.lessons l
        JOIN public.modules m ON m.id = l.module_id
        WHERE m.course_id = p_course_id
    ),
    student_progress AS (
        SELECT 
            lp.user_id,
            count(lp.lesson_id) filter (where lp.is_completed) as completed,
            max(lp.updated_at) as last_active
        FROM public.lesson_progress lp
        WHERE lp.course_id = p_course_id
        GROUP BY lp.user_id
    ),
    current_module AS (
        SELECT DISTINCT ON (lp.user_id)
            lp.user_id,
            m.title as mod_title
        FROM public.lesson_progress lp
        JOIN public.modules m ON m.id = lp.module_id
        WHERE lp.course_id = p_course_id
        ORDER BY lp.user_id, lp.updated_at DESC
    )
    SELECT 
        p.id as student_id,
        p.full_name,
        p.email,
        NULL::text as avatar_url,
        e.created_at as enrolled_at,
        COALESCE(sp.completed, 0) as completed_lessons,
        (SELECT total FROM course_stats) as total_lessons,
        CASE 
            WHEN (SELECT total FROM course_stats) = 0 THEN 0
            ELSE LEAST(100, (COALESCE(sp.completed, 0) * 100 / (SELECT total FROM course_stats))::int)
        END as progress_percent,
        sp.last_active as last_active_at,
        COALESCE(cm.mod_title, 'Not Started') as current_module_title
    FROM public.enrollments e
    JOIN public.profiles p ON p.id = e.student_id
    LEFT JOIN student_progress sp ON sp.user_id = e.student_id
    LEFT JOIN current_module cm ON cm.user_id = e.student_id
    WHERE e.course_id = p_course_id
    ORDER BY sp.last_active DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Get Detailed Student Progress Tree
-- Returns a flat list that the frontend can efficiently map to the known course structure
CREATE OR REPLACE FUNCTION public.get_student_detailed_progress(
    p_student_id uuid,
    p_course_id uuid
)
RETURNS TABLE (
    entity_type text, -- 'module' or 'lesson'
    entity_id uuid,
    parent_id uuid, -- For lessons, this is module_id; For modules, this is course_id
    title text,
    status text, -- 'completed', 'unlocked', 'locked' (for modules) or is_completed boolean (for lessons) mapped to text
    completed_at timestamptz,
    meta jsonb -- Extra data like score, last_watched, etc.
) AS $$
BEGIN
    RETURN QUERY
    -- Modules Progress
    SELECT 
        'module' as entity_type,
        m.id as entity_id,
        m.course_id as parent_id,
        m.title,
        COALESCE(mp.status, 'locked') as status,
        mp.completed_at,
        jsonb_build_object('week', m.week_number) as meta
    FROM public.modules m
    LEFT JOIN public.module_progress mp ON mp.module_id = m.id AND mp.user_id = p_student_id
    WHERE m.course_id = p_course_id
    
    UNION ALL
    
    -- Lessons Progress
    SELECT 
        'lesson' as entity_type,
        l.id as entity_id,
        l.module_id as parent_id,
        l.title,
        CASE WHEN lp.is_completed THEN 'completed' ELSE 'pending' END as status,
        lp.completed_at,
        jsonb_build_object('duration', l.duration_seconds, 'watched', lp.watched_seconds) as meta
    FROM public.modules m
    JOIN public.lessons l ON l.module_id = m.id
    LEFT JOIN public.lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = p_student_id
    WHERE m.course_id = p_course_id
    
    UNION ALL
    
    -- Assignments Progress (Bonus for completeness)
    SELECT
        'assignment' as entity_type,
        a.id as entity_id,
        a.module_id as parent_id,
        a.title,
        COALESCE(asub.reviewed_status, 'pending') as status,
        asub.updated_at as completed_at,
        jsonb_build_object('grade', asub.grade_score) as meta
    FROM public.modules m
    JOIN public.assignments a ON a.module_id = m.id
    LEFT JOIN public.assignment_submissions asub ON asub.assignment_id = a.id AND asub.user_id = p_student_id
    WHERE m.course_id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_course_students_progress(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_detailed_progress(uuid, uuid) TO authenticated;
