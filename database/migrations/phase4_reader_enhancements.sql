-- Migration Phase 4: Reader Enhancements (Bookmarks & Progress)

-- 1. Bookmarks Table
-- Allows users to save specific pages or locations in a PDF
CREATE TABLE IF NOT EXISTS public.book_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.book_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" ON public.book_bookmarks 
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can manage their own bookmarks" ON public.book_bookmarks 
    FOR ALL WITH CHECK (auth.uid()::text = user_id);


-- 2. Reading Progress Table
-- Tracks the last page read by the user for each book
CREATE TABLE IF NOT EXISTS public.reading_progress (
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    last_page INT DEFAULT 1 NOT NULL,
    total_pages INT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, book_id)
);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON public.reading_progress 
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can manage their own progress" ON public.reading_progress 
    FOR ALL WITH CHECK (auth.uid()::text = user_id);

SELECT 'Bookmarks & Reading Progress Tables Created' as status;
