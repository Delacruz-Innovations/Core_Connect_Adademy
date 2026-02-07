# Course Upload & Management Plan

## Overview
This plan outlines the architecture and implementation for a premium course management system within Core Connect Academy. It covers database schema, media storage, admin tools, and student-facing display.

## Phase 1: Database Architecture (The Backend)
We will implement a hierarchical structure to support complex course curricula.

### 1.1 Tables Summary
- **`courses`**: Main course metadata.
- **`modules`**: Groups for lessons within a course.
- **`lessons`**: Individual content units.
- **`course_enrollments`**: Linking students to courses.

### 1.2 Schema Detail (SQL)
- **`courses`**: `id`, `title`, `slug`, `description`, `short_description`, `level`, `thumbnail_url`, `is_published`, `author_id`.
- **`modules`**: `id`, `course_id`, `title`, `order_index`.
- **`lessons`**: `id`, `module_id`, `title`, `content_type` (video, markdown, quiz), `video_url`, `content_text`, `duration_minutes`, `order_index`.

## Phase 2: Media Storage Governance (Supabase Alternative)
We will use **Cloudinary** (or similar external hosting) for assets to reduce database load and leverage optimized CDNs.

### 2.1 Image & Asset Strategy
- **Thumbnails & Attachments**: Uploaded to Cloudinary (or external host).
- **Database**: We only store the **public URL** string in Supabase.

### 2.2 Video Hosting
- **Primary**: YouTube (Unlisted) or Vimeo.
- **Database**: We store the `video_url` or `embed_code`.

## Phase 3: Admin Portal UI (The Builder)
A high-end interface for admins to create and organize content.

### 3.1 Course Management Dashboard
- List of all courses with status badges (Draft, Live).
- Analytics overview (Total students, average rating).

### 3.2 Dynamic Course Creator
- **Step-by-step wizard**:
  1. Base Info & Branding.
  2. Curriculum Builder (Drag-and-drop module/lesson reordering).
  3. Pricing & Enrollment rules.
- **Rich Text Support**: Integration with React Quill or similar for lesson content.

## Phase 4: Student Experience Sync
Closing the loop in the Student Portal.

### 4.1 Course Player
- A persistent sidebar with course navigation.
- Video container with specialized lesson views.
- Progress tracking (Mark as Complete).

### 4.2 Explore Page
- Filterable cards based on real database data.
- "My Courses" view for enrolled students.

## Implementation Roadmap
1. [ ] **DB**: Execute SQL migrations for courses, modules, and lessons.
2. [ ] **Storage**: Configure Supabase storage buckets and RLS.
3. [ ] **Admin**: Build naming/configuration forms.
4. [ ] **Admin**: Build the "Curriculum Builder" (Nested Modules/Lessons).
5. [ ] **Student**: Update Dashboard and Browse pages to show real data.
6. [ ] **Student**: Build the interactive Course Player.
