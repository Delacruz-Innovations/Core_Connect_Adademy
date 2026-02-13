-- 📊 ENHANCED STUDENT DASHBOARD PROGRESS ANALYTICS RPC
-- Returns titles for the "Resume" banner and fixes schema mapping

CREATE OR REPLACE FUNCTION public.get_student_dashboard_progress(
    p_student_id uuid
)
RETURNS TABLE (
    id uuid,
    course_id uuid,
    course_title text,
    course_description text, 
    course_image_path text,
    course_code text,
    enrollment_status text,
    enrollment_date timestamptz,
    total_lessons bigint,
    completed_lessons bigint,
    progress_percent int,
    last_accessed_lesson_id uuid,
    last_accessed_lesson_title text, -- Added for Resume Banner
    last_accessed_module_id uuid,
    last_accessed_module_title text, -- Added for Resume Banner
    last_accessed_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    WITH course_metrics AS (
        -- Calculate totals per course (Only count published content)
        SELECT 
            c.id as c_id,
            COUNT(DISTINCT l.id) as total_count
        FROM public.courses c
        JOIN public.modules m ON m.course_id = c.id
        JOIN public.lessons l ON l.module_id = m.id
        WHERE c.is_published = true 
          AND m.is_published = true 
          AND l.is_published = true
        GROUP BY c.id
    ),
    progress_metrics AS (
        -- Calculate user progress per course
        SELECT 
            lp.course_id as c_id,
            COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.is_completed) as completed_count,
            MAX(lp.updated_at) as last_activity
        FROM public.lesson_progress lp
        WHERE lp.user_id = p_student_id
        GROUP BY lp.course_id
    ),
    last_access AS (
        -- Find the exact last accessed lesson for "Resume" functionality
        SELECT DISTINCT ON (lp.course_id)
            lp.course_id,
            lp.lesson_id,
            l.title as lesson_title,
            lp.module_id,
            m.title as module_title,
            lp.updated_at
        FROM public.lesson_progress lp
        JOIN public.lessons l ON l.id = lp.lesson_id
        JOIN public.modules m ON m.id = lp.module_id
        WHERE lp.user_id = p_student_id
        ORDER BY lp.course_id, lp.updated_at DESC
    )
    SELECT 
        c.id,
        c.id as course_id,
        c.title,
        c.description,
        c.thumbnail_url as course_image_path,
        c.slug as course_code,
        e.status as enrollment_status,
        e.created_at as enrollment_date,
        COALESCE(cm.total_count, 0) as total_lessons,
        COALESCE(pm.completed_count, 0) as completed_lessons,
        CASE 
            WHEN COALESCE(cm.total_count, 0) = 0 THEN 0
            ELSE LEAST(100, (COALESCE(pm.completed_count, 0) * 100 / cm.total_count)::int)
        END as progress_percent,
        la.lesson_id as last_accessed_lesson_id,
        la.lesson_title as last_accessed_lesson_title,
        la.module_id as last_accessed_module_id,
        la.module_title as last_accessed_module_title,
        la.updated_at as last_accessed_at
    FROM public.enrollments e
    JOIN public.courses c ON e.course_id = c.id
    LEFT JOIN course_metrics cm ON cm.c_id = c.id
    LEFT JOIN progress_metrics pm ON pm.c_id = c.id
    LEFT JOIN last_access la ON la.course_id = c.id
    WHERE e.student_id = p_student_id
    ORDER BY la.updated_at DESC NULLS LAST, e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_student_dashboard_progress(uuid) TO authenticated;
