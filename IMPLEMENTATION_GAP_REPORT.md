# Core Connect Academy - Implementation GAP Analysis
Derived from PRD.md vs Current Codebase State (2026-02-10)

## 🎓 Student Portal - Remaining Tasks
| Feature | PRD Reference | Status | Gap Description |
| :--- | :--- | :--- | :--- |
| **Email Verification Lock** | 4.1 | ⚠️ Partial | Registration works, but "Hard Gating" (blocking access until verified) is not strictly enforced in the dashboard entry. |
| **Persistent AI FAQ Button** | 4.2 | ❌ Missing | Persistent AI Assistant button is missing from the main Dashboard (is currently only in the Player). |
| **Assignment Indicators** | 4.2 | ⚠️ Partial | Dashboard cards show % progress but do not display specific "Week X Assignment: Pending" status badges. |
| **Sequential Unlocking** | 4.3 | 🔄 In Progress | Progress tracking exists, but "hard rules" (blocking Week n+1 strictly until Week n assignment is UPLOADED) needs final hardening. |
| **Resume Playback** | 4.4 | ⚠️ Needs Verification | Progress is tracked in DB, but the player initialization needs to ensure it auto-seeks to the last saved timestamp on reload. |
| **Replace Submission** | 4.5 | ❌ Missing | Ability for students to replace their PDF/DOC submission before the (yet to be defined) deadline. |

## 🛠️ Admin Portal - Remaining Tasks
| Feature | PRD Reference | Status | Gap Description |
| :--- | :--- | :--- | :--- |
| **Live Assignment Metrics** | 4.2 | ⚠️ Partial | Main dashboard has "63" hardcoded/placeholder. Needs live counts of pending vs reviewed submissions. |
| **AI Knowledge Management** | 5.2 | ⚠️ Placeholder | The page exists (`AIKnowledgeManagement.jsx`) but lacks the logic to "Ingest" course PDFs or FAQs into the AI's training context. |
| **Lead Management View** | 4.2 / 6.0 | ⚠️ Partial | Viewing "Applications" works, but a dedicated "Lead Pipeline" for un-converted interest is not fully fleshed out. |
| **Mark as Reviewed** | 4.5 | ❌ Missing | Admin interface for assignments needs a simple "Reviewed" status toggle as per MVP requirements. |
| **Password Reset (Admin)** | 4.1 | ❌ Missing | Secure token-based password reset for administrative accounts. |

## 🌐 Public Website - Remaining Tasks
| Feature | PRD Reference | Status | Gap Description |
| :--- | :--- | :--- | :--- |
| **Register Interest Lead Capture** | 7.0 | ⚠️ Partial | Confirming if all "Register Interest" buttons on the homepage/courses page correctly pipe data to the `applications` table. |
| **SEO Meta Hardening** | 9.0 | ⚠️ Needs Audit | Ensuring every public page has the descriptive meta tags and titles requested in the "Non-Functional" section. |

## ✅ Completed Milestones
*   **Authentication**: Supabase-ready login/signup for both portals.
*   **Course System**: Full CRUD for Courses, Modules, Lessons, Resources.
*   **Video Streaming**: Signed URL security implemented.
*   **Assignment Pipeline**: PDF/DOC upload logic for students; Review board for admins.
*   **Audit Logging**: Database-level triggers and Admin UI for activity monitoring.
*   **Q&A Desk**: Admin portal has a dedicated section for responding to student queries.
