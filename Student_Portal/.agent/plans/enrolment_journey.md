# Enrolment Journey Implementation Plan (Full Stack)

This plan details the architecture and implementation steps for the Enrolment Journey, integrating the Frontend (React) with the Backend (Supabase), specifically adhering to **Username & Password Authentication**.

## 1. Database Schema (Supabase)

### 1.1 Create `applications` Table
Stores enrolment applications. **Username must be unique.**

```sql
-- Create Enum Types
create type public.program_type as enum ('Mentorship', 'Apprenticeship');
create type public.application_status as enum ('pending', 'approved', 'rejected');

-- Create Applications Table
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  full_name text not null,
  username text not null unique, -- UNIQUE constraint
  email text not null,
  phone text,
  country text,
  city text,
  postcode text,
  current_role text,
  program_type public.program_type,
  program_name text,
  reason text,
  computer_literacy int,
  referrer_source text,
  referrer_name text,
  status public.application_status default 'pending'
);

-- Separate Profiles table for approved users
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  role text default 'student'
);

-- Index
create index applications_status_idx on public.applications (status);
```

### 1.2 RLS Policies
```sql
alter table public.applications enable row level security;

-- Insert Policy: Anyone can apply
create policy "Public Insert" on public.applications for insert with check (true);

-- Select Policy: Only admins
create policy "Admin View" on public.applications for select using (auth.role() = 'service_role');
```

## 2. Authentication Flow (Username & Password)

### 2.1 Registration (Pre-Auth)
- **Component**: `ShowInterestPage.jsx`
- **Username Check**:
  - Implementation: As the student types their `username`, the frontend MUST query Supabase to check availability.
  - Logic: `SELECT count(*) FROM applications WHERE username = ?` AND `SELECT count(*) FROM profiles WHERE username = ?`.
  - **Feedback**: If count > 0, show "Username already exists" error immediately.
- **Submission**: Form submits to `applications`. No `auth.user` created yet.

### 2.2 Approval & Account Creation
- **Admin**: Approves application.
- **System**:
  - Triggers an email to the student: "Your application is approved! Click here to set your password."
  - This link points to a **Set Password Page** (e.g., `/reset-password`).
  - *Behind the scenes*: Admin creates the `auth.user` with a temporary password or uses Supabase Invite API.

### 2.3 Login (Username & Password)
- **Component**: `LoginPage.jsx`
- **Challenge**: Supabase Auth uses Email/Password by default.
- **Solution (Lookup Flow)**:
  1. User enters `Username` and `Password`.
  2. Frontend queries: `SELECT email FROM profiles WHERE username = 'input_username'`.
  3. If found, call `supabase.auth.signInWithPassword({ email: found_email, password })`.
  4. If not found, return "Invalid credentials".

## 3. Implementation Checklist

- [ ] **Database**: Run SQL to create tables with unique username constraints.
- [ ] **Registration Frontend**: Implement `checkUsernameAvailability` function in `ShowInterestPage.jsx` (debounced).
- [ ] **Login Frontend**: Update `LoginPage.jsx` to accept Username instead of Email, and implement the lookup logic.
- [ ] **Admin**: Implement the "Approve" button which triggers the Invite/Email logic.
