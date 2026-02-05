"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IoArrowBack,
  IoBook,
  IoDownload,
  IoCreateOutline,
  IoCheckbox,
} from "react-icons/io5";
import { ReadingNotes } from "./ReadingNotes";

interface ReaderInterfaceProps {
  book: any;
}

export default function ReaderInterface({ book }: ReaderInterfaceProps) {
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header / Toolbar */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-800 bg-gray-900 z-30 relative shadow-lg">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
          >
            <IoArrowBack className="w-6 h-6" />
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold truncate max-w-[200px] sm:max-w-md">
              {book.title}
            </h1>
            <p className="text-xs text-gray-400 truncate">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notes Toggle */}
          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
              isNotesOpen
                ? "bg-brand-900/50 text-brand-400 border border-brand-800"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            <IoCreateOutline className="w-5 h-5" />
            <span className="hidden md:inline">Catatan</span>
          </button>

          {/* Finish & Review */}
          <Link
            href={`/reviews/create?book_id=${book.id}`}
            className="p-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors text-white flex items-center gap-2 text-sm font-medium"
          >
            <IoCheckbox className="w-4 h-4" />
            <span className="hidden sm:inline">Selesai & Review</span>
          </Link>

          {/* Download */}
          <a
            href={book.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white flex items-center gap-2 text-sm font-medium border border-gray-700"
            title="Download PDF"
          >
            <IoDownload className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* PDF View */}
        <div
          className={`flex-1 relative bg-gray-800 transition-all duration-300 ${isNotesOpen ? "mr-0 md:mr-[400px]" : ""}`}
        >
          {book.pdf_url ? (
            <iframe
              src={`${book.pdf_url}#toolbar=0&view=FitH`}
              className="absolute inset-0 w-full h-full border-none"
              title={book.title}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <IoBook className="w-20 h-20 mb-4 opacity-50 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">
                PDF Tidak Tersedia
              </h3>
              <p className="text-gray-500 max-w-sm mb-6">
                File PDF untuk buku ini mungkin belum diunggah atau link rusak.
              </p>
              <Link
                href="/library"
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
              >
                Kembali ke Perpustakaan
              </Link>
            </div>
          )}
        </div>

        {/* Notes Sidebar (Mobile: Overlay, Desktop: Push/Slide) */}
        <ReadingNotes
          bookSlug={book.slug}
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
        />
      </div>
    </div>
  );
}
