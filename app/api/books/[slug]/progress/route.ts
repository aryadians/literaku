import { createAdminClient } from "@/lib/supabase/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ progress: null });

    const params = await props.params;
    const slug = params.slug;
    const supabase = createAdminClient();

    // 1. Get book ID from slug
    const { data: book } = await supabase
      .from("books")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!book) return NextResponse.json({ progress: null });

    const { data } = await supabase
      .from("reading_progress")
      .select("last_page, total_pages")
      .eq("user_id", session.user.id)
      .eq("book_id", book.id)
      .single();

    return NextResponse.json({ progress: data || null });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await props.params;
    const slug = params.slug;
    const { lastPage, totalPages } = await request.json();

    const supabase = createAdminClient();

    // 1. Get book ID from slug
    const { data: book } = await supabase
      .from("books")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const { error } = await supabase
      .from("reading_progress")
      .upsert({
        user_id: session.user.id,
        book_id: book.id,
        last_page: lastPage,
        total_pages: totalPages,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, book_id' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
