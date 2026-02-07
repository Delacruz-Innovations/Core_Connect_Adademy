# Admin Portal Registration Management Plan

This plan details the implementation of the Registration Management features within the Admin Portal.

## 1. Overview
Enable Admins to view pending student applications (`applications` table), review details, and approve/reject them. Approval triggers user account creation.

## 2. Architecture

### 2.1 Backend (Supabase)
-   **Table**: `applications` (Shared with Student Portal).
-   **Edge Function `invite-student`**:
    -   Securely creates Auth user (Invite via Email).
    -   Creates Profile record.
    -   Updates Application status to 'approved'.

### 2.2 Frontend (Admin Portal)
**File**: `src/pages/EnrolmentManagement.jsx`

#### UI Components
1.  **Tabs**: `Pending` (Default), `Processed` (History).
2.  **Applications Table**:
    -   Columns: Date, Name, Username, Program, Status, Actions.
    -   Actions: "View Details", "Approve", "Reject".
3.  **Detail Modal**:
    -   Displays full application data.
    -   **"Approve & Invite"**: Calls Edge Function.
    -   **"Reject"**: Updates status locally.

## 3. Implementation Steps

1.  **Setup Edge Function**:
    -   Initialize local function: `supabase functions new invite-student`.
    -   Deploy function.

2.  **Update Admin Portal**:
    -   Create `components/ApplicationsList.jsx`.
    -   Update `pages/EnrolmentManagement.jsx` to include the list.
    -   Integrate with `supabase.functions.invoke('invite-student')`.

3.  **Security**:
    -   Ensure only Admins can access `EnrolmentManagement`.
