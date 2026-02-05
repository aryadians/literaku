import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IoArrowBack,
  IoBook,
  IoCalendar,
  IoPerson,
  IoDownload,
} from "react-icons/io5";

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header / Toolbar */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-800 bg-gray-900 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
          >
            <IoArrowBack className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-lg font-bold truncate max-w-[200px] sm:max-w-md">
              {book.title}
            </h1>
            <p className="text-xs text-gray-400 truncate">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={book.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-lg bg-brand-600 hover:bg-brand-700 transition-colors text-white flex items-center gap-2 text-sm font-medium"
          >
            <IoDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh</span>
          </a>
        </div>
      </div>

      {/* Main Content (PDF Viewer) */}
      <div className="flex-1 relative bg-gray-800">
        {book.pdf_url ? (
          <iframe
            src={`${book.pdf_url}#toolbar=0&view=FitH`}
            className="absolute inset-0 w-full h-full border-none"
            title={book.title}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <IoBook className="w-16 h-16 mb-4 opacity-50" />
            <p>File PDF tidak tersedia.</p>
          </div>
        )}
      </div>

      {/* Footer Info (Optional, can be toggled) */}
      {book.description && (
        <div className="bg-gray-900 border-t border-gray-800 p-4 text-sm text-gray-400 hidden sm:block">
          <p className="line-clamp-2 max-w-4xl mx-auto text-center">
            {book.description}
          </p>
        </div>
      )}
    </div>
  );
}
