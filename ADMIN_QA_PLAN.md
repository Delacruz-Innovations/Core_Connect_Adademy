# Admin Q&A Management Plan: Student Queries

## Objective
To provide a structured workflow for administrators to review, manage, and answer student questions posted at the Course, Module, or Lesson levels.

---

## 🏗️ 1. Database Schema Refinement
Currently, the system has a `lesson_questions` table. To support more flexible querying (at module or course level) and improved admin productivity, we will enhance it.

### Changes (Supabase SQL)
- Add `module_id` (UUID, optional) to `lesson_questions`.
- Add `course_id` (UUID, optional) to `lesson_questions`.
- Add `is_public` (boolean, default false) to allow admins to promote good questions to the FAQ section.
- Add `priority` (ENUM: 'low', 'medium', 'high').

---

## 🎨 2. Admin UI: Dedicated Q&A Board
A centralized board in the Admin Portal to prevent student questions from being missed.

### Interface: `QuestionManagement.jsx`
- **Metric Bar**: Overview of "Pending Response", "Resolved", and "Average Response Time".
- **Filter Board**: 
  - Filter by Course / Module selection.
  - Filter by Student (User search).
  - Filter by Status (Pending vs. Answered).
- **Question Card**:
  - Context Indicator: "Asked in: [Lesson Name] | [Module Name]".
  - Interaction Panel: Inline text editor for admin response.
  - Action: "Post & Mark Resolved" vs "Post as Internal Draft".
  - Action: "Convert to FAQ" (Toggles visibility for all students).

---

## 🔔 3. Automated Notification System
Ensuring students are notified immediately when an instructor answers their question.

### Database Trigger: `fn_notify_on_answer`
- A trigger on `lesson_questions` that listens for `UPDATE`.
- If `admin_response` changes from `NULL` to `NOT NULL`:
  - Insert record into `public.notifications` for the `student_id`.
  - Content: "Instructor [Name] has answered your question in [Lesson/Module Title]."

---

## 🛠️ 4. Integration Workflow

### Step 1: Migration
- Run SQL to update `lesson_questions` and add the `notifications` trigger.

### Step 2: API & Services
- update `get_questions` RPC or query to join with `lessons`, `modules`, and `courses` for full breadcrumb context in the admin view.

### Step 3: Admin Portal Implementation
1. Create `src/pages/QuestionManagement.jsx`.
2. Register route `/admin/qa` in `App.jsx`.
3. Add "Student Q&A" item to Sidebar navigation.

### Step 4: UI Polish
- Add "Type to Search" and "Filter by Course" dropdowns for high-volume question management.
- Implement real-time updates using Supabase Realtime so the admin list refreshes as students post.

---

## ✅ Success Metrics
- **Zero Unanswered**: No questions remain in "Pending" status for > 48 hours.
- **Improved Student Satisfaction**: Real-time notifications reduce student drop-off in difficult modules.
- **Scalable FAQ**: Admins can build a course knowledge base by promoting specific student questions.
