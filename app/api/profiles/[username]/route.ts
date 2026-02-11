import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ username: string }> },
) {
  const params = await props.params;
  const username = params.username;

  try {
    const supabase = await createClient();

    // 1. Fetch Profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, bio, website, created_at")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Fetch Reviews with categories
    const { data: reviews } = await supabase
      .from("book_reviews")
      .select(`
        id,
        title,
        slug,
        book_title,
        book_cover_url,
        rating,
        created_at,
        excerpt,
        categories (
          name
        )
      `)
      .eq("user_id", profile.id)
      .eq("published", true)
      .order("created_at", { ascending: false });

    // 3. Fetch Stats for Badges
    const { count: booksRead } = await supabase
      .from("read_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);

    return NextResponse.json({
      profile: {
        ...profile,
        name: profile.full_name // Map full_name to name for frontend compatibility
      },
      reviews: reviews || [],
      stats: {
        booksRead: booksRead || 0,
        reviewsCount: reviews?.length || 0
      }
    });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
