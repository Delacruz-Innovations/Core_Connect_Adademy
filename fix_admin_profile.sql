-- Diagnostic: Check admin profile setup
-- Run this in Supabase SQL Editor

-- 1. Check if the user exists
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at
FROM auth.users u
WHERE u.email = 'delacruzltd.sam@gmail.com';

-- 2. Check if profile exists with admin role
SELECT 
    p.id,
    p.full_name,
    p.role,
    p.updated_at
FROM profiles p
WHERE p.id IN (
    SELECT id FROM auth.users WHERE email = 'delacruzltd.sam@gmail.com'
);

-- 3. If profile doesn't exist, create it
INSERT INTO profiles (id, full_name, role)
SELECT 
    u.id,
    'Sam Delacruz',
    'admin'
FROM auth.users u
WHERE u.email = 'delacruzltd.sam@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = u.id
);

-- 4. If profile exists but role is wrong, update it
UPDATE profiles 
SET role = 'admin', 
    full_name = 'Sam Delacruz'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'delacruzltd.sam@gmail.com'
);

-- 5. Verify final state
SELECT 
    u.id,
    u.email,
    p.role,
    p.full_name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'delacruzltd.sam@gmail.com';
