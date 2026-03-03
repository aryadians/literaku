import { createAdminClient } from "@/lib/supabase/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ challenge: null });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    const supabase = createAdminClient();

    // 1. Get Challenge Target
    const { data: challenge } = await supabase
      .from("reading_challenges")
      .select("target_books")
      .eq("user_id", session.user.id)
      .eq("year", year)
      .single();

    // 2. Count Finished Books in that year
    const { count } = await supabase
      .from("reading_status")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("status", "finished")
      .gte("updated_at", `${year}-01-01`)
      .lte("updated_at", `${year}-12-31`);

    return NextResponse.json({
      target: challenge?.target_books || 0,
      completed: count || 0,
      year: year
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { target, year = new Date().getFullYear() } = body;

    if (!target || target < 1) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("reading_challenges")
      .upsert({
        user_id: session.user.id,
        year: year,
        target_books: target,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, year' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
