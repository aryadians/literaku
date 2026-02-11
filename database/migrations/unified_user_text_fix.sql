-- UNIFIED USER ID FIX (v9): Comprehensive Policy Cleanup
-- This version ensures ALL possible policies are dropped before altering column types.

-- ==========================================
-- 1. DROP ALL POLICIES (Extensive List)
-- ==========================================

-- PROFILES
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- BOOK_REVIEWS
DROP POLICY IF EXISTS "Users can create own reviews" ON public.book_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.book_reviews;
DROP POLICY IF EXISTS "Published reviews are viewable by everyone" ON public.book_reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.book_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.book_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.book_reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON book_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON book_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON book_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON book_reviews;

-- REVIEW_COMMENTS
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.review_comments;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.review_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.review_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.review_comments;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON review_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON review_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON review_comments;

-- COMMENTS (The other table)
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Public can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Public can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;

-- REVIEW_LIKES
DROP POLICY IF EXISTS "Public can view likes" ON public.review_likes;
DROP POLICY IF EXISTS "Users can toggle likes" ON public.review_likes;
DROP POLICY IF EXISTS "Users can remove likes" ON public.review_likes;
DROP POLICY IF EXISTS "Authenticated users can like reviews" ON public.review_likes;
DROP POLICY IF EXISTS "Authenticated users can unlike reviews" ON public.review_likes;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.review_likes;
DROP POLICY IF EXISTS "Users can unlike reviews" ON public.review_likes;
DROP POLICY IF EXISTS "Public can view likes" ON review_likes;
DROP POLICY IF EXISTS "Users can toggle likes" ON review_likes;
DROP POLICY IF EXISTS "Users can remove likes" ON review_likes;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON review_likes;
DROP POLICY IF EXISTS "Authenticated users can like reviews" ON review_likes;
DROP POLICY IF EXISTS "Authenticated users can unlike reviews" ON review_likes;
DROP POLICY IF EXISTS "Users can unlike reviews" ON review_likes;

-- CANVAS
DROP POLICY IF EXISTS "Users can view own canvas" ON public.personal_canvas;
DROP POLICY IF EXISTS "Users can insert own canvas" ON public.personal_canvas;
DROP POLICY IF EXISTS "Users can update own canvas" ON public.personal_canvas;
DROP POLICY IF EXISTS "Users can delete own canvas" ON public.personal_canvas;
DROP POLICY IF EXISTS "Users can view own canvas" ON personal_canvas;
DROP POLICY IF EXISTS "Users can insert own canvas" ON personal_canvas;
DROP POLICY IF EXISTS "Users can update own canvas" ON personal_canvas;
DROP POLICY IF EXISTS "Users can delete own canvas" ON personal_canvas;

-- HISTORY
DROP POLICY IF EXISTS "Users can view own history" ON public.read_history;
DROP POLICY IF EXISTS "Users can insert/update own history" ON public.read_history;
DROP POLICY IF EXISTS "Users can view own history" ON read_history;
DROP POLICY IF EXISTS "Users can insert/update own history" ON read_history;

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- READING_NOTES
DROP POLICY IF EXISTS "Users can view own notes" ON public.reading_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.reading_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.reading_notes;
DROP POLICY IF EXISTS "Users can view own notes" ON reading_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON reading_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON reading_notes;

-- BOOKS
DROP POLICY IF EXISTS "Admin Manage" ON public.books;
DROP POLICY IF EXISTS "Admins can manage books" ON public.books;
DROP POLICY IF EXISTS "Public can view books" ON public.books;
DROP POLICY IF EXISTS "Books are viewable by everyone" ON public.books;
DROP POLICY IF EXISTS "Admins can insert books" ON public.books;
DROP POLICY IF EXISTS "Admins can update books" ON public.books;
DROP POLICY IF EXISTS "Admins can delete books" ON public.books;
DROP POLICY IF EXISTS "Admin Manage" ON books;
DROP POLICY IF EXISTS "Admins can manage books" ON books;
DROP POLICY IF EXISTS "Public can view books" ON books;
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;
DROP POLICY IF EXISTS "Admins can insert books" ON books;
DROP POLICY IF EXISTS "Admins can update books" ON books;
DROP POLICY IF EXISTS "Admins can delete books" ON books;

-- ==========================================
-- 2. DROP CONSTRAINTS
-- ==========================================
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.book_reviews DROP CONSTRAINT IF EXISTS book_reviews_user_id_fkey;
ALTER TABLE IF EXISTS public.review_comments DROP CONSTRAINT IF EXISTS review_comments_user_id_fkey;
ALTER TABLE IF EXISTS public.review_likes DROP CONSTRAINT IF EXISTS review_likes_user_id_fkey;
ALTER TABLE IF EXISTS public.personal_canvas DROP CONSTRAINT IF EXISTS personal_canvas_user_id_fkey;
ALTER TABLE IF EXISTS public.read_history DROP CONSTRAINT IF EXISTS read_history_user_id_fkey;
ALTER TABLE IF EXISTS public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE IF EXISTS public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS public.notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
ALTER TABLE IF EXISTS public.reading_notes DROP CONSTRAINT IF EXISTS reading_notes_user_id_fkey;
ALTER TABLE IF EXISTS public.books DROP CONSTRAINT IF EXISTS books_uploaded_by_fkey;

-- ==========================================
-- 3. ALTER COLUMN TYPES
-- ==========================================
ALTER TABLE IF EXISTS public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.book_reviews ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS public.review_comments ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS public.review_likes ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS public.personal_canvas ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS public.read_history ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS public.comments ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN actor_id TYPE TEXT;
ALTER TABLE IF EXISTS public.reading_notes ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE IF EXISTS public.books ALTER COLUMN uploaded_by TYPE TEXT;

-- ==========================================
-- 4. RE-ENABLE RLS & RECREATE POLICIES
-- ==========================================
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.book_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.review_likes ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid())::text = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid())::text = id);

-- Review Comments
CREATE POLICY "Comments are viewable by everyone" ON public.review_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.review_comments FOR INSERT WITH CHECK ((auth.uid())::text = user_id);

-- Review Likes
CREATE POLICY "Public can view likes" ON public.review_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like reviews" ON public.review_likes FOR INSERT WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY "Authenticated users can unlike reviews" ON public.review_likes FOR DELETE USING ((auth.uid())::text = user_id);

-- Books
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.book_reviews FOR SELECT USING (true);

-- ==========================================
-- 5. RE-ENABLE CONSTRAINTS
-- ==========================================
ALTER TABLE IF EXISTS public.book_reviews ADD CONSTRAINT book_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.review_comments ADD CONSTRAINT review_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.review_likes ADD CONSTRAINT review_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.personal_canvas ADD CONSTRAINT personal_canvas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.read_history ADD CONSTRAINT read_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.notifications ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.reading_notes ADD CONSTRAINT reading_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.books ADD CONSTRAINT books_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

SELECT 'SUCCESS: Unified User ID Fix Applied (v9)' as status;
