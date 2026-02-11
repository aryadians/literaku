-- 1. Fix Table Structure (Add missing columns safe mode)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;

-- 2. Repair Data (Insert missing profiles)
INSERT INTO public.profiles (id, username, full_name, avatar_url)
SELECT 
  id, 
  -- Generate unique username
  COALESCE(raw_user_meta_data->>'name', 'user_' || substr(md5(id::text), 1, 8)) || '_' || substr(md5(random()::text), 1, 4),
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 3. Show Result
SELECT count(*) as total_users_fixed FROM public.profiles;