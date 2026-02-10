-- Create Personal Canvas Table
CREATE TABLE IF NOT EXISTS public.personal_canvas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT DEFAULT 'Untitled Note',
  content JSONB DEFAULT '[]'::jsonb, -- Store block-based content
  is_favorite BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.personal_canvas ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own canvas" ON public.personal_canvas;

CREATE POLICY "Users can view own canvas" ON public.personal_canvas FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can insert own canvas" ON public.personal_canvas;

CREATE POLICY "Users can insert own canvas" ON public.personal_canvas FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update own canvas" ON public.personal_canvas;

CREATE POLICY "Users can update own canvas" ON public.personal_canvas FOR
UPDATE USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can delete own canvas" ON public.personal_canvas;

CREATE POLICY "Users can delete own canvas" ON public.personal_canvas FOR DELETE USING (auth.uid () = user_id);

-- Note: The Storage Bucket "canvas-media" should be created via Supabase Dashboard or API
-- but we can document the policy here if needed.