# PLAN: Assignment Indicators for Student Dashboard

## Objective
Enhance the Student Dashboard course cards to show clear, high-contrast indicators for module assignments (e.g., "Week 3 Assignment: PENDING").

## Implementation Steps

### 1. Data Mapping (Logic)
- In `StudentDashboard.jsx`, update the `fetchInitialState` function.
- When mapping `enrolledCourses`, we need to determine the assignment status for the `nextModule`.
- **Logic**:
    1. For the identified `nextModule`, check the `assignments` table for any associated records.
    2. Check the `assignment_submissions` table to see if the current user has uploaded an asset.
    3. Assign a status: `pending`, `submitted`, or `none` (if no assignment exists for that week).

### 2. UI Enhancement (Component)
- Update the course card render in `StudentDashboard.jsx`.
- Replace the simple "Week X: Title" badge with a more informative assignment indicator.
- **Design**:
    - **Pending**: High-contrast outline, "ASSIGNMENT DUE" label, warning icon.
    - **Submitted**: Green background, "SUBMITTED" label, checkmark.

### 3. Testing
- Verify that a course with a submitted assignment shows green.
- Verify that a course with no assignment doesn't show an "Assignment" label.
- Verify that a newly unlocked week shows "PENDING".
