-- 1. Add Role to Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Set existing users as admin (since you are the owner)
UPDATE public.profiles SET role = 'admin';

-- 2. Create Books Table (Digital Library)
CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  publisher TEXT,
  year INTEGER,
  pages INTEGER,
  category_id UUID REFERENCES public.categories(id),
  cover_url TEXT,
  pdf_url TEXT NOT NULL, -- The actual book file
  uploaded_by UUID REFERENCES public.profiles(id)
);

-- 3. Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Books
-- Public can VIEW
CREATE POLICY "Public can view books" ON public.books FOR
SELECT USING (true);

-- Only Admin can INSERT/UPDATE/DELETE
CREATE POLICY "Admins can insert books" ON public.books FOR
INSERT
WITH
    CHECK (
        exists (
            select 1
            from public.profiles
            where
                id = auth.uid ()
                and role = 'admin'
        )
    );

CREATE POLICY "Admins can update books" ON public.books FOR
UPDATE USING (
    exists (
        select 1
        from public.profiles
        where
            id = auth.uid ()
            and role = 'admin'
    )
);

CREATE POLICY "Admins can delete books" ON public.books FOR DELETE USING (
    exists (
        select 1
        from public.profiles
        where
            id = auth.uid ()
            and role = 'admin'
    )
);

-- 5. Storage Bucket Policies (Instructional - run in Dashboard/Storage)
-- We need a bucket named 'library-books' and 'library-covers'
-- Policy: Public Read, Admin Insert.

-- 6. Link Reviews to Books (Optional Future Step)
-- For now, we keep reviews separate OR we can add book_id to book_reviews
ALTER TABLE public.book_reviews
ADD COLUMN IF NOT EXISTS book_reference_id UUID REFERENCES public.books (id);

SELECT 'PDF Library Schema Created. You are now ADMIN.' as status;