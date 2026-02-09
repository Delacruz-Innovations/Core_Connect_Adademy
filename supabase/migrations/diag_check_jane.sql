-- DIAGNOSTIC: Check student existence and profile state
SELECT 
    u.id as auth_id,
    u.email,
    u.raw_user_meta_data->>'username' as meta_username,
    p.id as profile_id,
    p.username as profile_username,
    p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email ILIKE '%Jane%' OR p.username ILIKE '%Jane%';
