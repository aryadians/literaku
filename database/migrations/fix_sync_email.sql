-- FINAL REPAIR: Sync Profile with EMAIL included
INSERT INTO public.profiles (id, email, username, full_name, avatar_url)
SELECT 
  id,
  email, -- Added this field
  COALESCE(raw_user_meta_data->>'name', 'user_' || substr(md5(id::text), 1, 8)) || '_' || substr(md5(random()::text), 1, 4),
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Verify
SELECT count(*) as total_users FROM public.profiles;