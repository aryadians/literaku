import { summarizeBook } from "@/lib/ai";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { bookId } = await request.json();

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch Book Details
    const { data: book, error } = await supabase
      .from("books")
      .select("title, author, description, ai_summary")
      .eq("id", bookId)
      .single();

    if (error || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // 2. Return cached summary if exists
    if (book.ai_summary) {
      return NextResponse.json({ summary: book.ai_summary });
    }

    // 3. Generate new summary
    const summary = await summarizeBook(book.title, book.author, book.description || "");

    if (!summary) {
      throw new Error("Failed to generate summary");
    }

    // 4. Cache the summary in DB
    await supabase
      .from("books")
      .update({ ai_summary: summary })
      .eq("id", bookId);

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
