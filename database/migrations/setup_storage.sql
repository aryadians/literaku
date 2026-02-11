-- SETUP STORAGE BUCKETS
-- Run this in your Supabase SQL Editor to create the necessary buckets

-- 1. Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('canvas-media', 'canvas-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('library-covers', 'library-covers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('library-books', 'library-books', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Clean up existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;

-- 3. Set up Storage Policies
-- Generic Public Read Access for all public buckets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('profiles', 'canvas-media', 'library-covers', 'library-books'));

-- PROFILES: Allow users to upload to their own folder
CREATE POLICY "Profiles Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');
CREATE POLICY "Profiles Update" ON storage.objects FOR UPDATE USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- CANVAS-MEDIA: Allow authenticated uploads
CREATE POLICY "Canvas Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'canvas-media' AND auth.role() = 'authenticated');

-- LIBRARY: Allow authenticated uploads (Admin functionality usually handled in UI)
CREATE POLICY "Library Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('library-covers', 'library-books') AND auth.role() = 'authenticated');
CREATE POLICY "Library Update" ON storage.objects FOR UPDATE USING (bucket_id IN ('library-covers', 'library-books') AND auth.role() = 'authenticated');
