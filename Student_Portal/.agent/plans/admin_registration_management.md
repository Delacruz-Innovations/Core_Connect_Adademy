# Admin Registration Management Plan

This plan details the "Admin Registration Phase", focusing on how Admins manage incoming student applications within the Admin Portal.

## 1. Overview
The Admin Portal needs a dedicated interface to:
1.  View incoming applications from the Student Portal (`applications` table).
2.  Review application details (CV is waiting for future, currently basic info).
3.  **Approve**: Trigger student account creation and onboarding email.
4.  **Reject**: Mark application as rejected.

## 2. Architecture & Data Flow

### 2.1 Backend (Supabase)
We utilize the `applications` table defined in the Enrolment Journey Plan.

**New Requirement: Edge Function `invite-student`**
-   **Why**: Client-side Admin Portal cannot securely create Auth users without exposing the Service Role Key (security risk).
-   **Solution**: An Edge Function (serverless) that handles the privileged `auth.admin` operations.

**Function Logic (`invite-student`)**:
```typescript
// Pseudo-code for Edge Function
serve(async (req) => {
  const { applicationId, email, full_name, username } = await req.json();
  
  // 1. Create Auth User (or Invite)
  const { data: user, error } = await supabase.auth.admin.inviteUserByEmail(email);
  if (error) return new Response(error.message, { status: 400 });

  // 2. Create Profile Record
  await supabase.from('profiles').insert({
    id: user.id,
    username: username,
    full_name: full_name,
    role: 'student'
  });

  // 3. Update Application Status
  await supabase.from('applications')
    .update({ status: 'approved' })
    .eq('id', applicationId);

  return new Response("User invited & Approved", { status: 200 });
});
```

### 2.2 Frontend (Admin Portal)
**File**: `src/pages/EnrolmentManagement.jsx`

#### UI Components
1.  **Tabs**: `Pending` (Default), `Processed` (History).
2.  **Applications Table**:
    -   Columns: Date, Name, Username (Requested), Program, Status, Actions.
    -   Actions: "View Details", "Approve", "Reject".
3.  **Detail Modal**:
    -   Shows full application data (Reason for joining, literacy score, etc.).
    -   **"Approve & Invite" Button**: Calls `invite-student` Edge Function.
    -   **"Reject" Button**: Updates status to `rejected` locally.

#### State Management
-   `applications`: Array of application objects.
-   `loading`: Boolean.
-   `selectedApp`: Object (for modal).

## 3. Implementation Steps (No Code, Just Plan)

1.  **Setup Edge Function**:
    -   Initialize Supabase local dev.
    -   Create function `supabase functions new invite-student`.
    -   Deploy function.

2.  **Update Admin Portal**:
    -   Add `ApplicationsList` component.
    -   Integrate with `supabase.functions.invoke('invite-student')`.

3.  **Security**:
    -   Ensure `EnrolmentManagement.jsx` is protected by `AdminRoute` (only roles `admin` or `super_admin`).
    -   Ensure Edge Function verifies the caller is an Admin.
