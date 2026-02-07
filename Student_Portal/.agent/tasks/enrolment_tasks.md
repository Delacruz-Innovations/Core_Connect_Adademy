# Enrolment Journey Implementation Tasks

This task list tracks the implementation of the Enrolment Journey plan defined in `.agent/plans/enrolment_journey.md`.

## Phase 1: Database Setup (Supabase)
- [ ] **1.1 Execute SQL Schema**: 
  - Run the SQL provided in the Plan (Section 1.1 & 1.2) in Supabase SQL Editor.
  - Verifies creation of `applications` table, `profiles` table, and RLS policies.
- [ ] **1.2 Verify Policies**: Ensure `anon` role can Insert into `applications`.

## Phase 2: Student Portal Implementation
- [ ] **2.1 Install Dependencies**: Run `npm install @supabase/supabase-js` in `Student_Portal`.
- [ ] **2.2 Configure Client**: Create `src/lib/supabaseClient.js` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] **2.3 Registration Logic (`ShowInterestPage.jsx`)**:
  - [ ] Implement `checkUsernameAvailability(username)`: Query `applications` and `profiles` to ensure uniqueness.
  - [ ] Implement `submitApplication(formData)`: Insert data into `applications` table.
  - [ ] Add loading states and error handling for submission.
- [ ] **2.4 Login Logic (`LoginPage.jsx`)**:
  - [ ] Implement `lookupEmailByUsername(username)`: Query `profiles` table to find email.
  - [ ] Implement `login(email, password)`: Use `supabase.auth.signInWithPassword`.

## Phase 3: Admin Portal Implementation
- [ ] **3.1 Install Dependencies**: Run `npm install @supabase/supabase-js` in `Admin_Portal`.
- [ ] **3.2 Configure Client**: Create `src/lib/supabaseClient.js` (ideally with `service_role` key or admin user logic).
- [ ] **3.3 Application Review UI**:
  - [ ] Add "Pending Applications" tab to `EnrolmentManagement.jsx`.
  - [ ] Fetch pending applications from Supabase.
- [ ] **3.4 Approval Workflow**:
  - [ ] Implement "Approve" action.
  - [ ] (Backend/Function) Create Auth User + Profile + Send Email.
  - [ ] Update Application status to `approved`.
