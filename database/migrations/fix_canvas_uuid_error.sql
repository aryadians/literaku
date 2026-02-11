-- EMERGENCY FIX: Resolving UUID Format Error for Social Login (Numeric IDs)
-- This script converts user_id to TEXT to accommodate numeric NextAuth IDs (like from GitHub)
-- and updates RLS policies to be type-agnostic.

-- 1. DROP EXISTING CONSTRAINTS AND POLICIES
ALTER TABLE public.personal_canvas
DROP CONSTRAINT IF EXISTS personal_canvas_user_id_fkey;

DROP POLICY IF EXISTS "Users can view own canvas" ON public.personal_canvas;

DROP POLICY IF EXISTS "Users can insert own canvas" ON public.personal_canvas;

DROP POLICY IF EXISTS "Users can update own canvas" ON public.personal_canvas;

DROP POLICY IF EXISTS "Users can delete own canvas" ON public.personal_canvas;

-- 2. ALTER COLUMN TYPE
-- First, cast existing data if any (UUID to TEXT is safe)
ALTER TABLE public.personal_canvas ALTER COLUMN user_id TYPE TEXT;

-- 3. RECREATE RLS POLICIES (Type-Safe using ::text)
ALTER TABLE public.personal_canvas ENABLE ROW LEVEL SECURITY;

-- Select: Match decoded JWT sub against user_id
CREATE POLICY "Users can view own canvas" ON public.personal_canvas FOR
SELECT USING (
  (auth.uid())::text = user_id::text
);

-- Insert: Match decoded JWT sub against user_id
CREATE POLICY "Users can insert own canvas" ON public.personal_canvas FOR
INSERT WITH CHECK (
  (auth.uid())::text = user_id::text
);

-- Update: Match decoded JWT sub against user_id
CREATE POLICY "Users can update own canvas" ON public.personal_canvas FOR
UPDATE USING (
  (auth.uid())::text = user_id::text
);

-- Delete: Match decoded JWT sub against user_id
CREATE POLICY "Users can delete own canvas" ON public.personal_canvas FOR
DELETE USING (
  (auth.uid())::text = user_id::text
);

-- Log result
SELECT 'FIX: personal_canvas now supports numeric social IDs' as status;