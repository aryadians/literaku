-- Fix RLS Policies for Books
ALTER TABLE IF EXISTS books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;

CREATE POLICY "Books are viewable by everyone" ON books FOR
SELECT USING (true);

-- Ensure Reviews are visible
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON book_reviews;

CREATE POLICY "Reviews are viewable by everyone" ON book_reviews FOR
SELECT USING (published = true);

-- Ensure Categories are visible
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;

CREATE POLICY "Categories are viewable by everyone" ON categories FOR
SELECT USING (true);