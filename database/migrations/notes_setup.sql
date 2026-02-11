-- Create Reading Notes Table
CREATE TABLE IF NOT EXISTS reading_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  book_slug TEXT NOT NULL,
  content TEXT DEFAULT '', -- Markdown content or JSON for canvas if needed
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, book_slug) -- One note per book per user
);

-- Enable RLS
ALTER TABLE reading_notes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own notes" ON reading_notes;

CREATE POLICY "Users can view own notes" ON reading_notes FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON reading_notes;

CREATE POLICY "Users can insert own notes" ON reading_notes FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON reading_notes;

CREATE POLICY "Users can update own notes" ON reading_notes FOR
UPDATE USING (auth.uid () = user_id);

-- Upsert Function (Helper)
CREATE OR REPLACE FUNCTION upsert_note(p_book_slug TEXT, p_content TEXT)
RETURNS JSON AS $$
DECLARE
  v_note_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  INSERT INTO reading_notes (user_id, book_slug, content)
  VALUES (v_user_id, p_book_slug, p_content)
  ON CONFLICT (user_id, book_slug)
  DO UPDATE SET content = p_content, updated_at = now()
  RETURNING id INTO v_note_id;
  
  RETURN json_build_object('id', v_note_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;