import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch counts from different tables
    const [
      { count: booksCount },
      { count: profilesCount },
      { count: reviewsCount },
      { count: categoriesCount }
    ] = await Promise.all([
      supabase.from("books").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("book_reviews").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true })
    ]);

    return NextResponse.json({
      books: booksCount || 0,
      users: profilesCount || 0,
      reviews: reviewsCount || 0,
      categories: categoriesCount || 0
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
