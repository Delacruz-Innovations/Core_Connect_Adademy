# Enhanced Enrollment Workflow Implementation Plan

## Overview
This plan outlines the complete student enrollment journey from application submission through account activation, including admin approval, course assignment, payment tracking, and email notifications.

## Phase 1: Database Schema Updates

### 1.1 New Tables & Columns

```sql
-- Add to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS notified_at timestamptz;

-- Create enrollments table (tracks approved students with course assignments)
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  application_id uuid REFERENCES applications(id),
  student_id uuid REFERENCES auth.users(id),
  courses text[], -- Array of course names/IDs
  payment_amount decimal(10,2),
  payment_method text CHECK (payment_method IN ('transfer', 'cash', 'crypto')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial')),
  admin_id uuid REFERENCES auth.users(id),
  admin_notes text
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  event_type text NOT NULL, -- 'application_submitted', 'application_approved', 'enrollment_created', etc.
  user_id uuid REFERENCES auth.users(id),
  admin_id uuid REFERENCES auth.users(id),
  entity_type text, -- 'application', 'enrollment', 'user'
  entity_id uuid,
  details jsonb,
  ip_address text
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  recipient_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  message text NOT NULL,
  type text CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  link text,
  metadata jsonb
);
```

### 1.2 Email Templates Storage
```sql
-- Store email templates for reusability
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables text[], -- List of variables like {{student_name}}, {{course_name}}
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Phase 2: Email Notifications

### 2.1 Application Submission Email (Immediate)
**Trigger:** When student submits application
**Recipient:** Student (email from form)
**Content:**
- Thank you message
- Application reference number
- What to expect next
- Estimated review time

### 2.2 Application Approval Email (Admin Action)
**Trigger:** When admin approves application
**Recipient:** Student
**Content:**
- Congratulations message
- Assigned courses list
- Payment details (amount, methods)
- Next steps

### 2.3 Password Setup Email (After Approval)
**Trigger:** After admin approves and user account is created
**Recipient:** Student
**Content:**
- Welcome message
- Secure link to set password (magic link with token)
- Password requirements
- Link expiry time (24 hours)

### 2.4 Implementation: Edge Function for Emails
```typescript
// supabase/functions/send-email/index.ts
// Uses Supabase's built-in email or Resend/SendGrid integration
```

## Phase 3: Admin Approval Workflow Enhancement

### 3.1 Update ApplicationsList Component
**Location:** `Admin_Portal/src/components/ApplicationsList.jsx`

**Changes:**
1. Replace simple "Approve" button with "Review & Approve" modal
2. Modal includes:
   - Course selection (multi-select dropdown)
   - Payment amount input
   - Payment method selection (Transfer/Cash/Crypto)
   - Payment status (Pending/Paid/Partial)
   - Admin notes textarea

### 3.2 Create ApprovalModal Component
```jsx
// Admin_Portal/src/components/ApprovalModal.jsx
- Course multi-select
- Payment form
- Submit to create enrollment + update application status
```

### 3.3 Update Edge Function: invite-student
**Location:** `supabase/functions/invite-student/index.ts`

**Enhancements:**
1. Accept additional parameters: `courses`, `paymentAmount`, `paymentMethod`, `adminNotes`
2. Create enrollment record
3. Send password setup email (magic link)
4. Create audit log entry
5. Create admin notification

## Phase 4: Password Setup Flow

### 4.1 Password Setup Page (Student Portal)
**Location:** `Student_Portal/src/pages/SetPasswordPage.jsx`

**Features:**
- Token validation (from email link)
- Password input with strength meter
- Confirm password
- Password requirements display:
  - Minimum 12 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- Submit to set password and activate account

### 4.2 Password Strength Validation
```javascript
const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  return Object.values(requirements).every(Boolean);
};
```

## Phase 5: Audit Logs & Notifications

### 5.1 Audit Log Component
**Location:** `Admin_Portal/src/pages/AuditLogs.jsx`

**Features:**
- Filter by event type, date range, user
- Display timeline of events
- Export to CSV

### 5.2 Notifications Component
**Location:** `Admin_Portal/src/components/NotificationCenter.jsx`

**Features:**
- Bell icon with unread count
- Dropdown showing recent notifications
- Mark as read functionality
- Link to full notifications page

### 5.3 Auto-create Notifications
**Triggers:**
- New application submitted → Notify all admins
- Application approved → Notify student
- Payment received → Notify admins

## Phase 6: Student Login & Dashboard Access

### 6.1 Update LoginPage
**Location:** `Student_Portal/src/pages/LoginPage.jsx`

**Changes:**
- Accept username + password
- Lookup email by username (from profiles table)
- Authenticate with Supabase
- Redirect to dashboard on success

### 6.2 Student Dashboard
**Location:** `Student_Portal/src/pages/StudentDashboard.jsx`

**Features:**
- Welcome message
- Enrolled courses list
- Progress tracking (placeholder for now)
- Profile settings link

## Implementation Order

### Sprint 1: Database & Core Infrastructure
1. ✅ Run SQL migrations (tables: enrollments, audit_logs, notifications, email_templates)
2. ✅ Create helper functions for audit logging
3. ✅ Set up email service configuration

### Sprint 2: Email System
4. ✅ Create email templates
5. ✅ Build send-email Edge Function
6. ✅ Implement application submission email
7. ✅ Test email delivery

### Sprint 3: Enhanced Admin Approval
8. ✅ Build ApprovalModal component
9. ✅ Update ApplicationsList to use modal
10. ✅ Update invite-student Edge Function
11. ✅ Test approval workflow

### Sprint 4: Password Setup
12. ✅ Create SetPasswordPage
13. ✅ Implement password validation
14. ✅ Test magic link flow

### Sprint 5: Audit & Notifications
15. ✅ Build NotificationCenter component
16. ✅ Update AuditLogs page
17. ✅ Wire up auto-notifications

### Sprint 6: Student Login & Dashboard
18. ✅ Update LoginPage for username/password
19. ✅ Create StudentDashboard
20. ✅ Test end-to-end flow

## Demo Courses (Placeholder)
```javascript
const demoCourses = [
  { id: 'BA101', name: 'Business Analysis Fundamentals' },
  { id: 'PM201', name: 'Project Management Professional' },
  { id: 'CS301', name: 'Cybersecurity Essentials' },
  { id: 'AI401', name: 'AI & Machine Learning Basics' }
];
```

## Security Considerations
1. Password reset tokens expire after 24 hours
2. Tokens are single-use only
3. Passwords hashed with bcrypt (Supabase default)
4. RLS policies enforce data access
5. Audit logs track all sensitive actions
6. Email links use secure tokens

## Next Steps
Start with Sprint 1 (Database setup) and proceed sequentially.
