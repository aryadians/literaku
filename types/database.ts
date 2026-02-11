export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookReview {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  book_title: string;
  book_author: string;
  book_cover_url: string | null;
  content: string;
  excerpt: string;
  rating: number;
  category_id: string | null;
  published: boolean;
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewLike {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}
