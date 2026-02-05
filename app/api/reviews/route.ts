import { NextRequest, NextResponse } from "next/server";
// import { createClient as createServerClient } from "@/lib/supabase/server";
// import { createClient } from "@supabase/supabase-js";

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

    // START: REAL DATABASE CONNECTION (Direct Client)
    // DEBUGGING: Use direct client to bypass SSR/Cookie issues for public data
    const supabaseDebug = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Simplest query possible: No joins, just data
    let query = supabaseDebug
      .from("book_reviews")
      .select("*", { count: "exact" }) // Select all fields, no joins
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (featured) {
      query = query.eq("featured", true);
    }

    const { data: reviews, error, count } = await query;
    // END: REAL DATABASE CONNECTION

    // MOCK DATA (DISABLED)
    /*
    const mockReviews = [
      {
        id: "mock-1",
        title: "Mock Review: Harry Potter",
        slug: "harry-potter-mock",
        book_title: "Harry Potter",
        book_author: "J.K. Rowling",
        book_cover_url: "https://m.media-amazon.com/images/I/71-++hbbERL.jpg",
        excerpt: "This is a mock review for testing purposes.",
        rating: 5,
        created_at: new Date().toISOString(),
        published: true,
        featured: false,
        user_id: "mock-user",
        // category_id: "mock-cat"
      },
    ];

    console.log("✅ Returning MOCK data");

    return NextResponse.json({
      reviews: mockReviews,
      pagination: {
        page,
        limit,
        total: 1,
        totalPages: 1,
      },
    });
    */

    if (error) {
      console.error("❌ SUPABASE QUERY ERROR:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews", details: error.message },
        { status: 500 },
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
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
