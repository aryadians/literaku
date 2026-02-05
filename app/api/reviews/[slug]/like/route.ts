import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = params.slug;

  // 1. Get review ID from slug
  const { data: review, error: reviewError } = await supabase
    .from("book_reviews")
    .select("id")
    .eq("slug", slug)
    .single();

  if (reviewError || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const reviewId = review.id;
  const userId = user.id;

  // 2. Check if already liked
  const { data: existingLike, error: likeError } = await supabase
    .from("review_likes")
    .select("*")
    .eq("user_id", userId)
    .eq("review_id", reviewId)
    .single();

  if (existingLike) {
    // Unlike
    const { error: deleteError } = await supabase
      .from("review_likes")
      .delete()
      .eq("user_id", userId)
      .eq("review_id", reviewId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ liked: false });
  } else {
    // Like
    const { error: insertError } = await supabase
      .from("review_likes")
      .insert({ user_id: userId, review_id: reviewId });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ liked: true });
  }
}
