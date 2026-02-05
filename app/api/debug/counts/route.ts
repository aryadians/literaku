import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { count: reviewsCount, error: err1 } = await supabase
    .from("book_reviews")
    .select("*", { count: "exact", head: true });
  const { count: profilesCount, error: err2 } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    reviewsCount,
    profilesCount,
    reviewsError: err1?.message,
    usersError: err2?.message,
  });
}
