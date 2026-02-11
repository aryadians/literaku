-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL, -- The recipient of the notification
  actor_id UUID REFERENCES profiles(id) NOT NULL, -- The person who triggered it
  type TEXT NOT NULL CHECK (type IN ('comment', 'like', 'reply')),
  reference_id UUID NOT NULL, -- ID of the review or comment
  reference_slug TEXT, -- Slug for easy navigation
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications FOR
SELECT USING (auth.uid () = user_id);

-- Policy: Users can update (mark as read) their own notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can update own notifications" ON notifications FOR
UPDATE USING (auth.uid () = user_id);

-- Trigger Function: Notify on New Comment
CREATE OR REPLACE FUNCTION handle_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  review_owner_id UUID;
  review_slug TEXT;
  actor_name TEXT;
BEGIN
  -- Get the owner of the review being commented on
  SELECT user_id, slug INTO review_owner_id, review_slug
  FROM book_reviews
  WHERE id = NEW.review_id;

  -- Get the name of the commenter
  SELECT name INTO actor_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Do not notify if commenting on own post
  IF review_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, reference_id, reference_slug, message)
    VALUES (
      review_owner_id,
      NEW.user_id,
      'comment',
      NEW.review_id,
      review_slug,
      actor_name || ' mengomentari review Anda.'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On Insert Comment
DROP TRIGGER IF EXISTS on_comment_created ON review_comments;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON review_comments
  FOR EACH ROW EXECUTE PROCEDURE handle_new_comment();