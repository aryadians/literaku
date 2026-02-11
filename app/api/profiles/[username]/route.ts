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

    // 1. Fetch Profile (Case-insensitive)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, bio, website, created_at")
      .ilike("username", username)
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

    // 4. Fetch Total Likes Received on all reviews
    const { data: reviewsData } = await supabase
      .from("book_reviews")
      .select("id")
      .eq("user_id", profile.id);
    
    const reviewIds = reviewsData?.map(r => r.id) || [];
    let totalLikesReceived = 0;
    if (reviewIds.length > 0) {
      const { count } = await supabase
        .from("review_likes")
        .select("*", { count: "exact", head: true })
        .in("review_id", reviewIds);
      totalLikesReceived = count || 0;
    }

    // 5. Fetch Comments Made by this user
    const { count: commentsMade } = await supabase
      .from("review_comments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);

    // 6. Fetch Unique Categories reviewed
    const { data: categoryData } = await supabase
      .from("book_reviews")
      .select("category_id")
      .eq("user_id", profile.id);
    const uniqueCategories = new Set(categoryData?.map(c => c.category_id)).size;

    return NextResponse.json({
      profile: {
        ...profile,
        name: profile.full_name || profile.username || "User"
      },
      reviews: reviews || [],
      stats: {
        booksRead: booksRead || 0,
        reviewsCount: reviews?.length || 0,
        likesReceived: totalLikesReceived,
        commentsMade: commentsMade || 0,
        categoriesCount: uniqueCategories
      }
    });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
