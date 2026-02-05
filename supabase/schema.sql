-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users (id) PRIMARY KEY,
    updated_at TIMESTAMP
    WITH
        TIME ZONE,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        website TEXT,
        bio TEXT
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (DROP first to ensure clean state or use logic to check existence)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile" ON profiles FOR
INSERT
WITH
    CHECK (auth.uid () = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;

CREATE POLICY "Categories are viewable by everyone" ON categories FOR
SELECT USING (true);

-- Book Reviews Table
CREATE TABLE IF NOT EXISTS book_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  book_title TEXT NOT NULL,
  book_author TEXT NOT NULL,
  book_cover_url TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON book_reviews;

CREATE POLICY "Reviews are viewable by everyone" ON book_reviews FOR
SELECT USING (published = true);

DROP POLICY IF EXISTS "Users can create reviews" ON book_reviews;

CREATE POLICY "Users can create reviews" ON book_reviews FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON book_reviews;

CREATE POLICY "Users can update own reviews" ON book_reviews FOR
UPDATE USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON book_reviews;

CREATE POLICY "Users can delete own reviews" ON book_reviews FOR DELETE USING (auth.uid () = user_id);

-- Comments Table
CREATE TABLE IF NOT EXISTS review_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES book_reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON review_comments;

CREATE POLICY "Comments are viewable by everyone" ON review_comments FOR
SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON review_comments;

CREATE POLICY "Authenticated users can create comments" ON review_comments FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

-- Likes/Bookmarks
CREATE TABLE IF NOT EXISTS review_likes (
  user_id UUID REFERENCES profiles(id) NOT NULL,
  review_id UUID REFERENCES book_reviews(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, review_id)
);

ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON review_likes;

CREATE POLICY "Likes are viewable by everyone" ON review_likes FOR
SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can like reviews" ON review_likes;

CREATE POLICY "Authenticated users can like reviews" ON review_likes FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Authenticated users can unlike reviews" ON review_likes;

CREATE POLICY "Authenticated users can unlike reviews" ON review_likes FOR DELETE USING (auth.uid () = user_id);

-- Functions & Triggers (Handle User Creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed Categories (Insert only if not exists)
INSERT INTO
    categories (name, slug, description)
VALUES (
        'Fiction',
        'fiction',
        'Cerita fiksi imajinatif'
    ),
    (
        'Non-Fiction',
        'non-fiction',
        'Karya non-fiksi berdasarkan fakta'
    ),
    (
        'Self-Help',
        'self-help',
        'Pengembangan diri dan motivasi'
    ),
    (
        'Business',
        'business',
        'Bisnis, ekonomi, dan manajemen'
    ),
    (
        'History',
        'history',
        'Sejarah dunia dan peradaban'
    ),
    (
        'Science',
        'science',
        'Sains dan teknologi'
    ),
    (
        'Biography',
        'biography',
        'Biografi dan memoar'
    ) ON CONFLICT (slug) DO NOTHING;