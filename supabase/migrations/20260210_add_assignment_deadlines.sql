-- Add due_at column to public.assignments for deadline enforcement
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS due_at timestamptz;

-- Add comment for clarity
COMMENT ON COLUMN public.assignments.due_at IS 'Optional deadline for assignment submission. Progression is gated by submission, and replacement is restricted after this timestamp.';
