-- Migration Phase 2: Reading Challenges & Book Collections

-- 1. Reading Challenges Table
-- Stores user's annual reading targets (e.g., "I want to read 12 books in 2026")
CREATE TABLE IF NOT EXISTS public.reading_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    year INT NOT NULL,
    target_books INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, year)
);

ALTER TABLE public.reading_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any challenge" ON public.reading_challenges FOR SELECT USING (true);
CREATE POLICY "Users can manage their own challenges" ON public.reading_challenges 
    FOR ALL WITH CHECK (auth.uid()::text = user_id);


-- 2. Book Collections (Playlists) Table
-- Users can create lists like "Must Read 2026" or "Philosophy Favorites"
CREATE TABLE IF NOT EXISTS public.book_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.book_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public collections" ON public.book_collections FOR SELECT USING (is_public = true OR auth.uid()::text = user_id);
CREATE POLICY "Users can manage their own collections" ON public.book_collections 
    FOR ALL WITH CHECK (auth.uid()::text = user_id);


-- 3. Collection Items Table (Link Books to Collections)
CREATE TABLE IF NOT EXISTS public.collection_items (
    collection_id UUID REFERENCES public.book_collections(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (collection_id, book_id)
);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view items in public collections" ON public.collection_items FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.book_collections WHERE id = collection_id AND (is_public = true OR auth.uid()::text = user_id)));
CREATE POLICY "Users can manage items in their own collections" ON public.collection_items 
    FOR ALL WITH CHECK (EXISTS (SELECT 1 FROM public.book_collections WHERE id = collection_id AND auth.uid()::text = user_id));

SELECT 'Reading Challenges & Collections Migration Completed' as status;
