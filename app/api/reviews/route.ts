import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/reviews
 * Fetch all published reviews with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const featured = searchParams.get("featured") === "true";
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("book_reviews")
      .select(
        `
        id,
        title,
        slug,
        book_title,
        book_author,
        book_cover_url,
        excerpt,
        rating,
        views,
        created_at,
        featured,
        profiles (
          name,
          avatar_url
        ),
        categories (
          name,
          slug
        ),
        review_likes (count)
      `,
        { count: "exact" },
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (featured) {
      query = query.eq("featured", true);
    }

    if (search) {
      // Search by title, book_title, or author
      // Using .or() filter
      query = query.or(
        `title.ilike.%${search}%,book_title.ilike.%${search}%,book_author.ilike.%${search}%`,
      );
    }

    if (category) {
      // Filter by category slug using inner join
      // We use !inner to enforce the filter
      query = query
        .eq("categories.slug", category)
        .not("categories", "is", null);

      // Note: For this to work with Supabase JS client and PostgREST,
      // the select statement needs to join categories correctly as done above.
      // However, sometimes simpler approach is filtering by category_id if we had it, but we have slug.
      // The .eq('categories.slug', val) works if the resource is embedded.
    }

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    // Format matches existing frontend expectations
    const formattedReviews = reviews?.map((review: any) => ({
      ...review,
      review_likes: review.review_likes?.[0]?.count || 0, // Simplified count
      likes: review.review_likes?.[0]?.count || 0, // Duplicate for compatibility
    }));

    return NextResponse.json({
      reviews: formattedReviews || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
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
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Basic validation
    if (!body.title || !body.content || !body.book_title || !body.rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Handle slug generation (simplistic)
    const slug =
      body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-") +
      "-" +
      Date.now().toString().slice(-4);

    // Insert Review
    const { data: review, error } = await supabase
      .from("book_reviews")
      .insert({
        title: body.title,
        slug: slug,
        book_title: body.book_title,
        book_author: body.book_author,
        book_cover_url: body.cover_url || null,
        content: body.content,
        excerpt: body.content.substring(0, 150) + "...",
        rating: body.rating,
        category_id: body.category_id || null, // Ensure frontend sends ID or handle logic
        user_id: user.id,
        published: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
