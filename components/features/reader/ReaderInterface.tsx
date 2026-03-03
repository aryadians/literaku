"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  IoArrowBack,
  IoBook,
  IoDownload,
  IoCreateOutline,
  IoCheckbox,
  IoChevronBack,
  IoMenu,
  IoBookmark,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoContrast,
  IoBookmarkOutline,
} from "react-icons/io5";
import { useSession } from "next-auth/react";
import { ReadingNotes } from "./ReadingNotes";
import Swal from "sweetalert2";

type ReaderTheme = "light" | "dark" | "sepia";

export default function ReaderInterface({ book }: { book: any }) {
  const { data: session } = useSession();
  const supabase = createClient();
  const [readingStatus, setReadingStatus] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  
  // Theme & Progress State
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("dark");
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  // Fetch History, Status, and Progress
  useEffect(() => {
    if (session?.user?.id && book?.id) {
      const recordHistory = async () => {
        await supabase.from("read_history").upsert(
          {
            user_id: session.user.id,
            book_id: book.id,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: "user_id, book_id" },
        );
      };
      recordHistory();
      
      const fetchStatus = async () => {
        try {
          const res = await fetch(`/api/books/${book.slug}/status`);
          if (res.ok) {
            const data = await res.json();
            setReadingStatus(data.status);
          }
        } catch (error) { console.error(error); }
      };
      fetchStatus();

      const fetchBookmarks = async () => {
        try {
          const res = await fetch(`/api/books/${book.id}/bookmarks`);
          if (res.ok) {
            const data = await res.json();
            setBookmarks(data.bookmarks || []);
          }
        } catch (error) { console.error(error); }
      };
      fetchBookmarks();
    }
  }, [session, book]);

  const handleStatusChange = async (newStatus: string | null) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/books/${book.slug}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setReadingStatus(newStatus);
    } catch (error) { console.error(error); }
    finally { setIsUpdatingStatus(false); }
  };

  const addBookmark = async () => {
    if (!session) return;
    const { value: note } = await Swal.fire({
      title: 'Tambah Bookmark',
      input: 'text',
      inputLabel: 'Catatan singkat (opsional)',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
    });

    try {
      const res = await fetch(`/api/books/${book.id}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageNumber: 1, note }), // Simplified: page 1 as we don't have direct PDF page access in iframe
      });
      if (res.ok) {
        const newBookmark = await res.json();
        setBookmarks([...bookmarks, newBookmark]);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Bookmark disimpan', showConfirmButton: false, timer: 2000 });
      }
    } catch (e) { console.error(e); }
  };

  const themes: Record<ReaderTheme, string> = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-900 text-white",
    sepia: "bg-[#f4ecd8] text-[#5b4636]"
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themes[readerTheme]} overflow-hidden`}>
      {/* Header / Toolbar */}
      <div className={`h-16 flex items-center justify-between px-4 sm:px-6 border-b z-30 relative shadow-lg ${readerTheme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'}`}>
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className={`p-2 rounded-full transition-colors ${readerTheme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-gray-800 text-gray-300'}`}
          >
            <IoArrowBack className="w-6 h-6" />
          </Link>
          <div className="hidden sm:block">
            <h1 className={`text-lg font-bold truncate max-w-[200px] sm:max-w-md ${readerTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              {book.title}
            </h1>
            <p className="text-xs text-gray-400 truncate">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <div className="flex bg-black/10 dark:bg-white/10 p-1 rounded-xl">
            {(["light", "sepia", "dark"] as ReaderTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setReaderTheme(t)}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                  readerTheme === t 
                    ? "bg-brand-600 text-white shadow-sm" 
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {t[0]}
              </button>
            ))}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={addBookmark}
            className="p-2 rounded-lg hover:bg-black/10 transition-colors"
            title="Tambah Bookmark"
          >
            <IoBookmarkOutline size={22} />
          </button>

          {/* Status Dropdown */}
          {session && (
            <div className="relative group hidden sm:block">
              <select
                value={readingStatus || ""}
                onChange={(e) => handleStatusChange(e.target.value || null)}
                disabled={isUpdatingStatus}
                className={`p-2 rounded-lg text-sm font-medium border outline-none cursor-pointer appearance-none pr-8 bg-transparent ${
                  readerTheme === 'light' ? 'border-gray-200 text-gray-700' : 'border-gray-700 text-gray-300'
                } ${
                  readingStatus === "finished" ? "text-green-500 border-green-500/50" :
                  readingStatus === "reading" ? "text-brand-500 border-brand-500/50" :
                  readingStatus === "want_to_read" ? "text-yellow-500 border-yellow-500/50" : ""
                }`}
              >
                <option value="">Status</option>
                <option value="want_to_read">Ingin Baca</option>
                <option value="reading">Sedang Baca</option>
                <option value="finished">Selesai</option>
              </select>
            </div>
          )}

          {/* Notes Toggle */}
          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
              isNotesOpen
                ? "bg-brand-600 text-white shadow-glow-sm"
                : "hover:bg-black/10"
            }`}
          >
            <IoCreateOutline className="w-5 h-5" />
            <span className="hidden md:inline">Panel</span>
          </button>

          {/* Finish & Review */}
          <Link
            href={`/reviews/create?book_id=${book.id}`}
            onClick={() => handleStatusChange("finished")}
            className="p-2 rounded-lg bg-green-600 hover:bg-green-700 transition-all text-white flex items-center gap-2 text-sm font-bold shadow-lg shadow-green-600/20 active:scale-95"
          >
            <IoCheckbox className="w-4 h-4" />
            <span className="hidden lg:inline">Selesai</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* PDF View */}
        <div
          className={`flex-1 relative transition-all duration-300 ${isNotesOpen ? "mr-0 md:mr-[400px]" : ""} ${readerTheme === 'sepia' ? 'grayscale-[0.2] sepia-[0.3]' : ''}`}
        >
          {book.pdf_url ? (
            <iframe
              src={`${book.pdf_url}#toolbar=0&view=FitH`}
              className="absolute inset-0 w-full h-full border-none"
              title={book.title}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <IoBook className="w-20 h-20 mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">PDF Tidak Tersedia</h3>
              <Link href="/library" className="px-6 py-2 bg-brand-600 rounded-full text-white font-bold transition-all hover:scale-105">
                Kembali ke Perpustakaan
              </Link>
            </div>
          )}
        </div>

        {/* Notes Sidebar */}
        <ReadingNotes
          bookSlug={book.slug}
          bookId={book.id}
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
        />
      </div>
    </div>
  );
}
