import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } },
) {
  try {
    const supabase = await createClient();
    const { username } = params;

    // 1. Fetch Profile
    // Note: We assume 'username' matches 'name' in metadata for now if 'username' column is empty
    // But ideally schema has username. Let's try fetching by username col first.
    // Since names in next-auth are often full names, we might need fuzzy search or exact match on username col.

    // Check if we have username column populated. If not, fallback to name?
    // Let's assume username column is used.

    // First, find the user ID from the username
    // Since username is in profiles table:
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", username) // Case insensitive match
      .single();

    if (profileError || !profile) {
      // Fallback: Try searching by name if username is not found (for legacy/google auth users who might not have set username)
      const { data: profileByName, error: nameError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("name", `%${username}%`) // Very loose search, strictly for demo purposes
        .limit(1)
        .single();

      if (nameError || !profileByName) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Found by name
      // Fetch their reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from("book_reviews")
        .select(
          `
            id,
            title,
            slug,
            book_title,
            book_cover_url,
            rating,
            excerpt,
            created_at,
            categories (name)
        `,
        )
        .eq("user_id", profileByName.id)
        .eq("published", true)
        .order("created_at", { ascending: false });

      return NextResponse.json({
        profile: profileByName,
        reviews: reviews || [],
      });
    }

    // 2. Fetch Reviews by User ID
    const { data: reviews, error: reviewsError } = await supabase
      .from("book_reviews")
      .select(
        `
        id,
        title,
        slug,
        book_title,
        book_cover_url,
        rating,
        excerpt,
        created_at,
        categories (name)
      `,
      )
      .eq("user_id", profile.id)
      .eq("published", true)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      profile,
      reviews: reviews || [],
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
