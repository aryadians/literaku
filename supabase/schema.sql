-- Literaku Database Schema for Supabase
-- Book Review Blog Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT TIMEZONE ('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT TIMEZONE ('utc', NOW()) NOT NULL
);

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT TIMEZONE ('utc', NOW()) NOT NULL
);

-- Book Reviews table
CREATE TABLE book_reviews (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    book_title TEXT NOT NULL,
    book_author TEXT NOT NULL,
    book_cover_url TEXT,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    rating INTEGER CHECK (
        rating >= 1
        AND rating <= 5
    ) NOT NULL,
    category_id UUID REFERENCES categories (id) ON DELETE SET NULL,
    published BOOLEAN DEFAULT FALSE NOT NULL,
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT TIMEZONE ('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT TIMEZONE ('utc', NOW()) NOT NULL
);

-- Comments table
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    review_id UUID REFERENCES book_reviews (id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT TIMEZONE ('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT TIMEZONE ('utc', NOW()) NOT NULL
);

-- Review Likes table
CREATE TABLE review_likes (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    review_id UUID REFERENCES book_reviews (id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT TIMEZONE ('utc', NOW()) NOT NULL,
        UNIQUE (review_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_book_reviews_user_id ON book_reviews (user_id);

CREATE INDEX idx_book_reviews_category_id ON book_reviews (category_id);

CREATE INDEX idx_book_reviews_published ON book_reviews (published);

CREATE INDEX idx_book_reviews_featured ON book_reviews (featured);

CREATE INDEX idx_book_reviews_slug ON book_reviews (slug);

CREATE INDEX idx_comments_review_id ON comments (review_id);

CREATE INDEX idx_comments_user_id ON comments (user_id);

CREATE INDEX idx_review_likes_review_id ON review_likes (review_id);

CREATE INDEX idx_review_likes_user_id ON review_likes (user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_reviews_updated_at BEFORE UPDATE ON book_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

-- Categories policies (read-only for all, admin insert/update/delete)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR
SELECT USING (true);

-- Book Reviews policies
CREATE POLICY "Published reviews are viewable by everyone" ON book_reviews FOR
SELECT USING (
        published = true
        OR auth.uid () = user_id
    );

CREATE POLICY "Users can create own reviews" ON book_reviews FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own reviews" ON book_reviews FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own reviews" ON book_reviews FOR DELETE USING (auth.uid () = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments FOR
SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own comments" ON comments FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid () = user_id);

-- Review Likes policies
CREATE POLICY "Review likes are viewable by everyone" ON review_likes FOR
SELECT USING (true);

CREATE POLICY "Authenticated users can like reviews" ON review_likes FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can unlike reviews" ON review_likes FOR DELETE USING (auth.uid () = user_id);

-- Insert sample categories
INSERT INTO
    categories (name, slug, description)
VALUES (
        'Fiction',
        'fiction',
        'Karya fiksi naratif'
    ),
    (
        'Non-Fiction',
        'non-fiction',
        'Buku berdasarkan fakta dan realitas'
    ),
    (
        'Psychology',
        'psychology',
        'Psikologi dan perilaku manusia'
    ),
    (
        'Philosophy',
        'philosophy',
        'Filsafat dan pemikiran'
    ),
    (
        'History',
        'history',
        'Sejarah dan peristiwa masa lalu'
    ),
    (
        'Science',
        'science',
        'Sains dan penelitian ilmiah'
    ),
    (
        'Self-Help',
        'self-help',
        'Pengembangan diri'
    ),
    (
        'Biography',
        'biography',
        'Biografi dan memoar'
    );

-- Create storage bucket for book covers (run in Supabase Dashboard Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true);

-- Storage policies (run after creating bucket)
-- CREATE POLICY "Book covers are publicly accessible"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'book-covers');

-- CREATE POLICY "Authenticated users can upload book covers"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'book-covers' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can update own book covers"
--     ON storage.objects FOR UPDATE
--     USING (bucket_id = 'book-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own book covers"
--     ON storage.objects FOR DELETE
--     USING (bucket_id = 'book-covers' AND auth.uid()::text = (storage.foldername(name))[1]);