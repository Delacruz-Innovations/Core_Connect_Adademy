# CORE CONNECT ACADEMY - Admin Portal

This is the production-ready frontend for the Core Connect Academy LMS Admin Portal.

## Technical Stack
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS 4
- **Auth & Backend**: Supabase
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

1. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Portal Structure

### Authentication & Guards
- **AuthGuard**: Ensures a valid session exists.
- **VerifiedGuard**: Ensures the admin email is verified.
- **AdminGuard**: Ensures the user has the `admin` role in the `profiles` table.

### Main Routes
- `/admin/dashboard`: Global metrics and quick actions.
- `/admin/users`: Identity and access management.
- `/admin/courses`: Curriculum management.
- `/admin/enrolments`: Student admission control.
- `/admin/ai-knowledge`: Vector database priming for AI.
- `/admin/audit-logs`: Security and compliance monitoring.

## Design System
The portal uses the core brand color `#0066CC` and a premium, high-contrast aesthetic with italicized typography for key headings, matching the Student Portal's visual identity.
