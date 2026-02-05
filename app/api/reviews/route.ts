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
      // Filter by category slug if provided (requires category join filter or separate logic)
      // Simplified: Assuming we filter by joining categories tables
      // Supabase complex filtering on joined tables can be tricky with simple syntax
      // For now, let's keep it simple or use inner join filter syntax:
      // .eq('categories.slug', category) // This syntax depends on PostgREST version
      // If standard referencing: !inner to filter
      // query = query.not("categories", "is", null).eq("categories.slug", category);
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
