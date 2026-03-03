-- 1. Add created_at column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Sync created_at from auth.users for existing records
UPDATE public.profiles p
SET created_at = u.created_at
FROM auth.users u
WHERE p.id = u.id AND p.created_at IS NULL;

-- 3. Update the handle_new_user function to include created_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, created_at)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    created_at = EXCLUDED.created_at
  WHERE profiles.created_at IS NULL;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
