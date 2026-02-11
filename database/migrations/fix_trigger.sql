-- 1. Drop existing trigger and function to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user ();

-- 2. Re-create the function with better error handling and conflict resolution
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles. If ID exists (shouldn't happen on new user), do nothing.
  -- If Username exists, we need to handle it.
  -- Since we can't easily retry with a new random name in SQL here without complex logic,
  -- we will try to insert. If it fails due to username conflict, we'll try to append a distinct suffix.
  
  BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'name', 'user_' || substr(md5(random()::text), 1, 8)), -- Fallback if name is null
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'avatar_url'
    );
  EXCEPTION WHEN unique_violation THEN
    -- If username conflict, try appending random string
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
      new.id, 
      (new.raw_user_meta_data->>'name') || '_' || substr(md5(random()::text), 1, 6),
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'avatar_url'
    );
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();