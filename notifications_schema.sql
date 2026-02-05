-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  actor_id UUID REFERENCES profiles(id), -- Who performed the action (optional)
  type TEXT NOT NULL, -- 'like', 'comment', 'system'
  message TEXT NOT NULL,
  reference_slug TEXT, -- Slug of the review or book
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can update own notifications" ON notifications FOR
UPDATE USING (auth.uid () = user_id);

-- Trigger Function: Notify on Comment
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  review_owner_id UUID;
  review_slug TEXT;
  actor_name TEXT;
  review_title TEXT;
BEGIN
  -- Get Review Details
  SELECT user_id, slug, title INTO review_owner_id, review_slug, review_title
  FROM book_reviews
  WHERE id = NEW.review_id;

  -- Get Actor Name
  SELECT full_name INTO actor_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Don't notify if commenting on own review
  IF review_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, message, reference_slug)
    VALUES (
      review_owner_id,
      NEW.user_id,
      'comment',
      COALESCE(actor_name, 'Seseorang') || ' mengomentari review Anda: "' || COALESCE(review_title, 'Review') || '"',
      review_slug
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On Comment Insert
DROP TRIGGER IF EXISTS on_review_comment ON review_comments;

CREATE TRIGGER on_review_comment
  AFTER INSERT ON review_comments
  FOR EACH ROW EXECUTE PROCEDURE notify_on_comment();

-- Trigger Function: Notify on Like
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  review_owner_id UUID;
  review_slug TEXT;
  actor_name TEXT;
  review_title TEXT;
BEGIN
  -- Get Review Details
  SELECT user_id, slug, title INTO review_owner_id, review_slug, review_title
  FROM book_reviews
  WHERE id = NEW.review_id;

  -- Get Actor Name
  SELECT full_name INTO actor_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Don't notify if liking own review
  IF review_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, message, reference_slug)
    VALUES (
      review_owner_id,
      NEW.user_id,
      'like',
      COALESCE(actor_name, 'Seseorang') || ' menyukai review Anda: "' || COALESCE(review_title, 'Review') || '"',
      review_slug
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On Like Insert
DROP TRIGGER IF EXISTS on_review_like ON review_likes;

CREATE TRIGGER on_review_like
  AFTER INSERT ON review_likes
  FOR EACH ROW EXECUTE PROCEDURE notify_on_like();