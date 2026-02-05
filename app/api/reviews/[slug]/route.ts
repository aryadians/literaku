import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }, // Updated for Next.js 15+
) {
  try {
    const supabase = await createClient();
    const slug = (await params).slug;

    // Fetch Review with relations
    const { data: review, error } = await supabase
      .from("book_reviews")
      .select(
        `
        id,
        title,
        book_title,
        book_author,
        book_cover_url,
        content,
        excerpt,
        rating,
        views,
        created_at,
        profiles (
          name,
          avatar_url,
          bio
        ),
        categories (
          name,
          slug
        ),
        review_likes (
          user_id
        ),
        review_comments (
          id,
          content,
          created_at,
          user_id,
          profiles (
            name,
            avatar_url
          )
        )
      `,
      )
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !review) {
      if (error?.code === "PGRST116") {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404 },
        );
      }
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { error: "Error fetching review" },
        { status: 500 },
      );
    }

    // Sort comments by created_at desc (newest first)
    // Supabase can do this in querying but sometimes syntax is complex for nested resources
    if (review.review_comments && Array.isArray(review.review_comments)) {
      review.review_comments.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
