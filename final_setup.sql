-- 1. Reading History
CREATE TABLE IF NOT EXISTS public.read_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  book_id UUID REFERENCES public.books(id) NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, book_id)
);

ALTER TABLE public.read_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own history" ON public.read_history;

CREATE POLICY "Users can view own history" ON public.read_history FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can insert/update own history" ON public.read_history;

CREATE POLICY "Users can insert/update own history" ON public.read_history FOR ALL USING (auth.uid () = user_id);

-- 2. Social Tables (Likes & Comments)
CREATE TABLE IF NOT EXISTS public.review_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  review_id UUID REFERENCES public.book_reviews(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, review_id)
);

ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view likes" ON public.review_likes;

CREATE POLICY "Public can view likes" ON public.review_likes FOR
SELECT USING (true);

DROP POLICY IF EXISTS "Users can toggle likes" ON public.review_likes;

CREATE POLICY "Users can toggle likes" ON public.review_likes FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can remove likes" ON public.review_likes;

CREATE POLICY "Users can remove likes" ON public.review_likes FOR DELETE USING (auth.uid () = user_id);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  review_id UUID REFERENCES public.book_reviews(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view comments" ON public.comments;

CREATE POLICY "Public can view comments" ON public.comments FOR
SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;

CREATE POLICY "Users can insert comments" ON public.comments FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid () = user_id);

-- 3. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL, -- Recipient
  actor_id UUID REFERENCES public.profiles(id), -- Triggered by
  type TEXT NOT NULL, -- 'like', 'comment'
  message TEXT NOT NULL,
  reference_id UUID, -- ID of review
  reference_slug TEXT, -- Slug for link
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can update own notifications" ON public.notifications FOR
UPDATE USING (auth.uid () = user_id);

-- 4. Triggers for Notifications

-- Function: Notify on Comment
CREATE OR REPLACE FUNCTION notify_on_new_comment() RETURNS TRIGGER AS $$
DECLARE
  review_owner_id UUID;
  review_slug TEXT;
  review_title TEXT;
  actor_name TEXT;
BEGIN
  SELECT user_id, slug, title INTO review_owner_id, review_slug, review_title FROM public.book_reviews WHERE id = NEW.review_id;
  SELECT full_name INTO actor_name FROM public.profiles WHERE id = NEW.user_id;
  
  IF review_owner_id IS NOT NULL AND review_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, message, reference_id, reference_slug)
    VALUES (
      review_owner_id,
      NEW.user_id,
      'comment',
      COALESCE(actor_name, 'Seseorang') || ' mengomentari review "' || COALESCE(review_title, 'buku') || '"',
      NEW.review_id,
      review_slug
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_insert ON public.comments;

CREATE TRIGGER on_comment_insert AFTER INSERT ON public.comments FOR EACH ROW EXECUTE PROCEDURE notify_on_new_comment();

-- Function: Notify on Like
CREATE OR REPLACE FUNCTION notify_on_new_like() RETURNS TRIGGER AS $$
DECLARE
  review_owner_id UUID;
  review_slug TEXT;
  review_title TEXT;
  actor_name TEXT;
BEGIN
  SELECT user_id, slug, title INTO review_owner_id, review_slug, review_title FROM public.book_reviews WHERE id = NEW.review_id;
  SELECT full_name INTO actor_name FROM public.profiles WHERE id = NEW.user_id;

  IF review_owner_id IS NOT NULL AND review_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, message, reference_id, reference_slug)
    VALUES (
      review_owner_id,
      NEW.user_id,
      'like',
      COALESCE(actor_name, 'Seseorang') || ' menyukai review "' || COALESCE(review_title, 'buku') || '"',
      NEW.review_id,
      review_slug
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_insert ON public.review_likes;

CREATE TRIGGER on_like_insert AFTER INSERT ON public.review_likes FOR EACH ROW EXECUTE PROCEDURE notify_on_new_like();

-- Enable Realtime
-- alter publication supabase_realtime add table public.notifications;
-- (Commented out to prevent error if already exists. Run manually if needed)