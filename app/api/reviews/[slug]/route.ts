import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/reviews/[slug]
 * Fetch a single review by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: review, error } = await supabase
      .from("book_reviews")
      .select(
        `
        *,
        profiles:user_id (id, name, avatar_url, bio),
        categories:category_id (id, name, slug),
        comments (
          *,
          profiles:user_id (id, name, avatar_url)
        ),
        review_likes (count)
      `,
      )
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Increment view count
    await supabase
      .from("book_reviews")
      .update({ views: review.views + 1 })
      .eq("id", review.id);

    return NextResponse.json({ review });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
