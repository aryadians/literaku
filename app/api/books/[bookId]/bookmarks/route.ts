import { createAdminClient } from "@/lib/supabase/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ bookId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ bookmarks: [] });

    const params = await props.params;
    const supabase = createAdminClient();

    const { data } = await supabase
      .from("book_bookmarks")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("book_id", params.bookId)
      .order("page_number", { ascending: true });

    return NextResponse.json({ bookmarks: data || [] });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ bookId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await props.params;
    const { pageNumber, note } = await request.json();

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("book_bookmarks")
      .insert({
        user_id: session.user.id,
        book_id: params.bookId,
        page_number: pageNumber,
        note: note
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ bookId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get("id");

    if (!bookmarkId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("book_bookmarks")
      .delete()
      .eq("id", bookmarkId)
      .eq("user_id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
