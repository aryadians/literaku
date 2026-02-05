import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ReaderInterface from "@/components/reader/ReaderInterface";

export const metadata = {
  title: "Baca Buku - Literaku",
  description: "Mode baca nyaman untuk perpustakaan digital Anda.",
};

export default async function ReadBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!book) {
    notFound();
  }

  return <ReaderInterface book={book} />;
}
