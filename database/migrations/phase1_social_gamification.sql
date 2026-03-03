-- Migration: Reading Status & Social Follows (FIXED for TEXT ID)

-- 1. Reading Status Table
-- Tracks whether a user wants to read, is reading, or has finished a book.
CREATE TABLE IF NOT EXISTS public.reading_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('want_to_read', 'reading', 'finished')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, book_id)
);

-- RLS for reading_status
ALTER TABLE public.reading_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid errors on re-run
DROP POLICY IF EXISTS "Users can view any reading status" ON public.reading_status;
DROP POLICY IF EXISTS "Users can insert their own reading status" ON public.reading_status;
DROP POLICY IF EXISTS "Users can update their own reading status" ON public.reading_status;
DROP POLICY IF EXISTS "Users can delete their own reading status" ON public.reading_status;

CREATE POLICY "Users can view any reading status"
    ON public.reading_status FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own reading status"
    ON public.reading_status FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own reading status"
    ON public.reading_status FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own reading status"
    ON public.reading_status FOR DELETE
    USING (auth.uid()::text = user_id);


-- 2. Follows Table
-- Tracks which user is following which user.
CREATE TABLE IF NOT EXISTS public.user_follows (
    follower_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id) -- Prevent self-following
);

-- RLS for user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view any follows" ON public.user_follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.user_follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON public.user_follows;

CREATE POLICY "Users can view any follows"
    ON public.user_follows FOR SELECT
    USING (true);

CREATE POLICY "Users can follow others"
    ON public.user_follows FOR INSERT
    WITH CHECK (auth.uid()::text = follower_id);

CREATE POLICY "Users can unfollow others"
    ON public.user_follows FOR DELETE
    USING (auth.uid()::text = follower_id);


-- 3. Update Profiles Table to cache counts for performance
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0;

-- Function to handle follow count updates
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        UPDATE public.profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for follow counts
DROP TRIGGER IF EXISTS on_follow_change ON public.user_follows;
CREATE TRIGGER on_follow_change
AFTER INSERT OR DELETE ON public.user_follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

SELECT 'Reading Status & Social Follows Migration Completed (Fixed Types)' as status;
