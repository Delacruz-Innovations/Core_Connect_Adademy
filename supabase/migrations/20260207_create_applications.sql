-- Safely create types
DO $$ BEGIN
    CREATE TYPE public.program_type AS ENUM ('Mentorship', 'Bootcamp', 'Internship');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  full_name text NOT NULL,
  username text, -- Unique check optional or strictly enforced
  email text NOT NULL,
  phone text,
  country text,
  city text,
  postcode text,
  job_role text, -- ensuring new name
  program_type public.program_type,
  program_name text,
  reason text,
  computer_literacy int,
  referrer_source text,
  referrer_name text,
  status public.application_status default 'pending',
  admin_id uuid references auth.users
);

-- Ensure columns exist if table already existed (idempotency)
DO $$ BEGIN
    ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS admin_id uuid references auth.users;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS job_role text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Handle column rename if old column exists and new one doesn't
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='current_role') THEN
        ALTER TABLE public.applications RENAME COLUMN "current_role" TO job_role;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN null; -- job_role might already exist
    WHEN undefined_column THEN null;
END $$;


-- Create Profiles Table (Public metadata for Authenticated Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at timestamptz DEFAULT now(),
  username text UNIQUE,
  full_name text,
  avatar_url text,
  website text,
  role text DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor'))
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Applications
-- 1. Allow public (anon) to insert applications (Submit Form)
DO $$ BEGIN
    CREATE POLICY "Enable insert for anon (applicants)" ON public.applications FOR INSERT TO anon WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Allow admins (service_role or authenticated with admin role) to view all
-- NOTE: For simple MVP, we might allow authenticated users to view OR use service_role in Admin Portal
DO $$ BEGIN
    CREATE POLICY "Enable read for authenticated users only" ON public.applications FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Allow admins to update status
DO $$ BEGIN
    CREATE POLICY "Enable update for authenticated users" ON public.applications FOR UPDATE TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- Policies for Profiles
DO $$ BEGIN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Additional Policy: Allow Service Role full access (Supabase default usually covers this, but good to be explicit if needed)
-- Note: Service key bypasses RLS, so no policy needed for it.
