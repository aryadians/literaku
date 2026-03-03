import { createAdminClient } from "@/lib/supabase/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Add item to collection
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const { book_id } = await request.json();

    if (!book_id) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify ownership of collection
    const { data: collection } = await supabase
      .from("book_collections")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("collection_items")
      .upsert({
        collection_id: params.id,
        book_id: book_id
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Remove item from collection
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const { searchParams } = new URL(request.url);
    const book_id = searchParams.get("book_id");

    if (!book_id) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify ownership
    const { data: collection } = await supabase
      .from("book_collections")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", session.user.id)
      .single();

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", params.id)
      .eq("book_id", book_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
