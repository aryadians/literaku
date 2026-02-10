import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: books, error } = await supabase
    .from("books")
    .select("*, categories(name)")
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(books);
}
