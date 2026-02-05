import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  const username = params.username;

  // Mock Data Delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock Profile Data
  const profile = {
    id: "user-123",
    name: "Mock User",
    username: username,
    avatar_url: null, // or a placeholder URL
    bio: "Book lover. Coffee addict. Writing reviews in my free time.",
    website: "https://example.com",
    created_at: new Date().toISOString(),
  };

  // Mock Reviews Data associated with this user
  const reviews = [
    {
      id: "review-1",
      title: "The Great Gatsby: A Classic?",
      slug: "the-great-gatsby-review",
      book_title: "The Great Gatsby",
      book_author: "F. Scott Fitzgerald",
      book_cover_url:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg",
      rating: 5,
      excerpt:
        "A hauntingly beautiful story of wealth, love, and the American Dream...",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      categories: { name: "Fiction" },
    },
    {
      id: "review-2",
      title: "Atomic Habits: Life Changing",
      slug: "atomic-habits-review",
      book_title: "Atomic Habits",
      book_author: "James Clear",
      book_cover_url:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg",
      rating: 4,
      excerpt: "Practical strategies to form good habits and break bad ones.",
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      categories: { name: "Self-Help" },
    },
  ];

  return NextResponse.json({
    profile,
    reviews,
  });
}
