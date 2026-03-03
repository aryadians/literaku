import { createAdminClient } from "@/lib/supabase/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Get user's collections
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ collections: [] });
    }

    const supabase = createAdminClient();
    const { data: collections, error } = await supabase
      .from("book_collections")
      .select(`
        *,
        collection_items (
          book_id,
          books (title, cover_url)
        )
      `)
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ collections });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create new collection
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, is_public = true } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("book_collections")
      .insert({
        user_id: session.user.id,
        name,
        description,
        is_public
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
