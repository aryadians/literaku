import { NextRequest, NextResponse } from "next/server";

// MOCK DATA RESPONSE (For Debugging & Development)
const mockReviews = [
  {
    id: "mock-1",
    title: "Harry Potter and the Sorcerer's Stone",
    slug: "harry-potter-mock",
    book_title: "Harry Potter",
    book_author: "J.K. Rowling",
    book_cover_url: "https://m.media-amazon.com/images/I/71-++hbbERL.jpg",
    excerpt: "Petualangan seorang penyihir muda di sekolah sihir Hogwarts.",
    content: "# Harry Potter\n\nBuku ini sangat fenomenal...",
    rating: 5,
    created_at: new Date().toISOString(),
    published: true,
    featured: false,
    user_id: "mock-user",
    profiles: {
      name: "Reviewer A",
      avatar_url: "https://placehold.co/100x100",
    },
    categories: {
      name: "Fiksi",
      slug: "fiksi",
    },
    views: 120,
    review_likes: [{}, {}],
  },
  {
    id: "mock-2",
    title: "Laskar Pelangi",
    slug: "laskar-pelangi",
    book_title: "Laskar Pelangi",
    book_author: "Andrea Hirata",
    book_cover_url: "https://m.media-amazon.com/images/I/71-++hbbERL.jpg",
    excerpt: "Kisah inspiratif anak-anak Belitong mengejar mimpi.",
    content:
      "# Laskar Pelangi\n\nNovel ini mengajarkan kita arti perjuangan...",
    rating: 5,
    created_at: new Date().toISOString(),
    published: true,
    featured: true,
    user_id: "mock-user",
    profiles: {
      name: "Andrea Fan",
      avatar_url: "https://placehold.co/100x100",
    },
    categories: {
      name: "Inspirasi",
      slug: "inspirasi",
    },
    views: 850,
    review_likes: [{}],
  },
];

/**
 * GET /api/reviews
 * Fetch all published reviews with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const featured = searchParams.get("featured") === "true";

    console.log("✅ API: Returning MOCK data for /reviews");

    // Filter logic for mock data
    let filteredReviews = mockReviews;
    if (featured) {
      filteredReviews = mockReviews.filter((r) => r.featured === true);
    }

    // Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    return NextResponse.json({
      reviews: paginatedReviews,
      pagination: {
        page,
        limit,
        total: filteredReviews.length,
        totalPages: Math.ceil(filteredReviews.length / limit),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reviews
 * Create a new review
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Post disabled during mock debugging" },
    { status: 503 },
  );
}
