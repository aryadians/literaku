import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  props: { params: Promise<{ slug: string }> },
) {
  const params = await props.params;
  const slug = params.slug;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // 1. Get review ID from slug
  const { data: review, error: reviewError } = await supabase
    .from("book_reviews")
    .select("id")
    .eq("slug", slug)
    .single();

  if (reviewError || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  // 2. Insert Comment
  const { data: comment, error: insertError } = await supabase
    .from("comments")
    .insert({
      review_id: review.id,
      user_id: user.id,
      content: content.trim(),
    })
    .select(
      `
      id,
      content,
      created_at,
      user_id,
      profiles (
        name,
        avatar_url
      )
    `,
    )
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(comment);
}
