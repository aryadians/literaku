import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/reviews
 * Fetch all published reviews with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";

    const supabase = await createClient();

    let query = supabase
      .from("book_reviews")
      .select(
        `
        *,
        profiles:user_id (id, name, avatar_url),
        categories:category_id (id, name, slug),
        review_likes (count)
      `,
        { count: "exact" },
      )
      .eq("published", true)
      .order("created_at", { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq("categories.slug", category);
    }

    if (featured) {
      query = query.eq("featured", true);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
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
