PRODUCT REQUIREMENTS DOCUMENT (PRD)
Learning Management System (LMS)
Product Owner Standard: Multimillion-dollar SaaS, 20+ years
Build Target: AI-assisted Vibe Coding (Antigravity-ready)
Benchmark UX/UI: tritekacademy.co.uk
Colour System: External Logo / Brand Pack (attached separately)

1. PRODUCT OVERVIEW
1.1 Product Vision
Build a secure, structured, cohort-style LMS optimized for professional upskilling with:


Sequential learning enforcement


Assignment-driven progression


High completion rates


AI-assisted learner support


Admin-controlled outcomes


This is not a content dump platform.
This is a guided learning system with behavioural constraints.

1.2 Success Metrics (Non-Negotiable)
Metric Target Lead → Student Conversion≥ 25%Course Completion Rate≥ 70%Support Ticket Reduction (via AI)≥ 40%Week-to-Week Dropoff≤ 10%Video Completion Accuracy≥ 98%

2. PLATFORM USER ROLES (EXPLICIT)
Role, Description, Authenticated, Visitor, Public, unauthenticated user❌ LeadRegistered interest only❌ Registered UserVerified account, unenrolled✅ StudentEnrolled learner✅ AdminPlatform & content manager✅ AI AssistantSystem-level AI agentSystem

3. COMPLETE USER JOURNEYS (DETAILED)
🧭 JOURNEY 1: VISITOR → LEAD
Entry Points
Homepage
Course landing page
Social CTA
Referral link

Visitor Actions
View public content
View course summaries
Click Register Interest

System Behaviour

Render interest form (modal or page)
Validate required fields:
First name
Last name
Email
Course of interest
Store as Lead entity


Trigger confirmation email (non-login)

Exit State
✅ User becomes Lead

🧭 JOURNEY 2: LEAD → REGISTERED USER
Lead Actions


Receives invite email
Clicks Create Account
Sets password
Verifies email
System Behaviour
Generate secure verification token
Enforce email verification before login
Activate account on verification
Assign role = Registered User
Exit State
✅ User becomes Registered User (Unenrolled)

🧭 JOURNEY 3: REGISTERED USER → STUDENT
Enrolment Methods
Admin manual enrolment (MVP REQUIRED)
Self-enrolment (Feature-flagged, optional)
System Behaviour
Create enrollment record
Assign course access
Surface course on dashboard
Timestamp enrolment
Exit State
✅ User becomes Student

🧭 JOURNEY 4: STUDENT → ACTIVE LEARNER
Student Actions
Login
Access dashboard
Click course
Start Week 1
System Behaviour
Initialize progress tracking
Lock future modules
Persist video watch state



🧭 JOURNEY 5: COURSE CONSUMPTION (CORE LOOP)
Per Module (Week):

Watch video(s)
Download resources


Read assignment brief


Upload assignment


Mark week complete


Hard Rules


❌ No assignment upload → no completion


❌ No week skipping


✅ Admin override allowed



🧭 JOURNEY 6: COURSE COMPLETION
Student Actions


Complete final simulations


Upload final artefact pack


View post-course guidance


System Behaviour


Validate final submission


Mark course = Completed


Unlock post-course resources



🧭 JOURNEY 7: POST-COURSE
Student Capabilities


Rewatch videos


Download artefacts


Access AI FAQ assistant


View recommended next courses



4. PLATFORM FEATURES — FINAL & EXECUTION-READY

4.1 AUTHENTICATION & ACCESS (HARDENED)
Functional Requirements


Email + password auth


Mandatory email verification


Secure login/logout


Password reset via token


Role-based access control (RBAC)


Edge Rules


❌ Unverified users → no dashboard


❌ Unenrolled users → no course access


✅ Admin override always allowed



4.2 MEMBER DASHBOARD
Student Dashboard (REQUIRED)
Must display:


Enrolled courses (cards)


Course status:


Not Started


In Progress


Completed




Progress bar per course


“Continue Learning” CTA


Assignment status per module


AI FAQ Assistant button (persistent)


Admin Dashboard (REQUIRED)
Must display:


Total users


Leads vs Registered vs Students


Courses & modules


Assignment submission counts


Quick links:


Enrol student


Review submissions


Manage AI knowledge





4.3 COURSE MODULE SYSTEM (NON-NEGOTIABLE)
Course
 └── Module (Week)
      ├── Lesson (Video)
      ├── Resource (PDF, ZIP)
      └── Assignment

Behaviour Rules


Sequential unlocking only


Completion requires:


≥90% video watched


Assignment uploaded




Admin force-unlock allowed



4.4 VIDEO STREAMING
Functional


Stream-only (no downloads)


Resume playback


Track % watched


Enrolment-based access


Security


Signed URLs


Token-based access


Time-bound expiry



4.5 ASSIGNMENT MANAGEMENT
Student


Upload PDF / DOC


View submission timestamp


Replace submission before deadline


Admin


View by course/week


Download files


Mark as “Reviewed”


No grading in MVP



5. 🤖 AI FEATURES (MANDATORY)

5.1 AI FAQ ASSISTANT (MVP REQUIRED)
Purpose


Reduce confusion


Increase completion


Minimize admin support load


Access Points


Dashboard


Course player
Module view


Capabilities
AI must:
Answer course FAQs
Explain concepts simply
Guide on assignments (conceptual only)
Recommend lessons/resources
Explain career pathways
Hard Constraints
❌ No direct assignment answers
❌ No file generation for submissions

✅ Conceptual guidance only

5.2 AI KNOWLEDGE SOURCES
AI must ingest:
Course content
Assignment briefs
Platform rules
Career pathway docs
Admin-curated FAQs

6. ADMIN FEATURES (ENTERPRISE-GRADE MVP)
Admin must be able to:
Create / edit courses
Create modules (weeks)
Upload videos
Upload resources
Create assignments
Manage users
Enrol / unenrol students
View submissions
Manage AI knowledge base
7. WEBSITE PAGES (CONFIRMED)
Public


Home
About
Courses
How It Works
Register Interest
Login / Signup
Private
Dashboard
Course Player
Assignment Upload
Profile

AI FAQ Interface
8. UX / UI BENCHMARK (CRITICAL)
Reference: tritekacademy.co.uk
UI principles to replicate:
Clean, professional, training-focused
Minimal cognitive load
Strong hierarchy
Clear progress indicators
Desktop-first, mobile-responsive
No gamification clutter
No over-animation
No social feed patterns
Clarity > aesthetics
Colour grading to be applied after logo pack attachment.

9. NON-FUNCTIONAL REQUIREMENTS
AreaRequirementPerformance<2s page loadScalability10k concurrent learnersSecurityOWASP Top 10 compliantLoggingFull audit logsBackupsDaily automatedAvailability99.7% uptime

10. OUT OF SCOPE (MVP)
Payments
Certificates
Grades
Peer discussion forums
Messaging system