-- 1. Reading History Table
CREATE TABLE IF NOT EXISTS public.read_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  book_id UUID REFERENCES public.books(id) NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  progress INTEGER DEFAULT 0, -- percent or page number
  UNIQUE(user_id, book_id) -- Prevent duplicate entries for same book/user
);

-- RLS for read_history
ALTER TABLE public.read_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history" ON public.read_history FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert/update own history" ON public.read_history FOR ALL USING (auth.uid () = user_id);

-- 2. Review Likes Table
CREATE TABLE IF NOT EXISTS public.review_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  review_id UUID REFERENCES public.book_reviews(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, review_id) -- One like per user per review
);

-- RLS for review_likes
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view likes" ON public.review_likes FOR
SELECT USING (true);

CREATE POLICY "Users can toggle likes" ON public.review_likes FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can remove likes" ON public.review_likes FOR DELETE USING (auth.uid () = user_id);

-- 3. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  review_id UUID REFERENCES public.book_reviews(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view comments" ON public.comments FOR
SELECT USING (true);

CREATE POLICY "Users can insert comments" ON public.comments FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid () = user_id);

-- Enable Realtime for Comments (if not already enabled globally)
alter publication supabase_realtime add table public.comments;