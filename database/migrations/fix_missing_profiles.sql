-- Insert missing profiles for existing Auth Users
INSERT INTO public.profiles (id, username, full_name, avatar_url)
SELECT 
  id, 
  -- Generate unique username or use metadata
  COALESCE(raw_user_meta_data->>'name', 'user_' || substr(md5(id::text), 1, 8)) || '_' || substr(md5(random()::text), 1, 4),
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Check the count result
SELECT count(*) as total_profiles FROM public.profiles;