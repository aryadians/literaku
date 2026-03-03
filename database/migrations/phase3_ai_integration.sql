-- Migration Phase 3: AI Integration

ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

SELECT 'AI Summary Column Added to Books' as status;
