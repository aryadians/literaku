import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ status: null });
  }

  const supabase = createAdminClient();
  const slug = params.slug;

  // 1. Get book ID from slug
  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("id")
    .eq("slug", slug)
    .single();

  if (bookError || !book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // 2. Get Reading Status
  const { data: statusData } = await supabase
    .from("reading_status")
    .select("status")
    .eq("user_id", session.user.id)
    .eq("book_id", book.id)
    .single();

  return NextResponse.json({ status: statusData?.status || null });
}

export async function POST(
  request: Request,
  props: { params: Promise<{ slug: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await request.json();
  const { status } = body; // 'want_to_read', 'reading', 'finished', or null to remove

  const slug = params.slug;

  // 1. Get book ID from slug
  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("id")
    .eq("slug", slug)
    .single();

  if (bookError || !book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  if (!status) {
    // Remove status
    await supabase
      .from("reading_status")
      .delete()
      .eq("user_id", session.user.id)
      .eq("book_id", book.id);
    return NextResponse.json({ status: null });
  }

  // Upsert status
  const { data: updatedStatus, error: upsertError } = await supabase
    .from("reading_status")
    .upsert(
      {
        user_id: session.user.id,
        book_id: book.id,
        status: status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id, book_id" }
    )
    .select()
    .single();

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ status: updatedStatus.status });
}
