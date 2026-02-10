"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { IoClose, IoSave, IoDocumentText } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

interface ReadingNotesProps {
  bookSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReadingNotes({ bookSlug, isOpen, onClose }: ReadingNotesProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, bookSlug]);

  const fetchNotes = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("reading_notes")
      .select("content, updated_at")
      .eq("user_id", user.id)
      .eq("book_slug", bookSlug)
      .single();

    if (data) {
      setContent(data.content || "");
      setLastSaved(new Date(data.updated_at));
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Use RPC or direct upsert if RLS allows (UPSERT needs conflict target)
    // For simplicity with standard RLS, we check existence or use upsert logic
    // Using the upsert_note function I created in SQL is safest
    const { error } = await supabase.rpc("upsert_note", {
      p_book_slug: bookSlug,
      p_content: content,
    });

    if (!error) {
      setLastSaved(new Date());
    } else {
      console.error("Save error:", error);
    }
    setIsSaving(false);
  };

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (content) handleSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [content]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 text-gray-800 dark:text-white font-bold">
              <IoDocumentText className="text-brand-600" />
              <h3>Catatan Pribadi</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Editor */}
          <div className="flex-1 p-4 relative">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            ) : (
              <textarea
                className="w-full h-full resize-none bg-transparent outline-none text-gray-700 dark:text-gray-300 leading-relaxed placeholder:text-gray-400 font-mono text-sm"
                placeholder="Tulis ide, kutipan, atau pemikiran Anda di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {isSaving
                ? "Menyimpan..."
                : lastSaved
                  ? `Disimpan ${lastSaved.toLocaleTimeString()}`
                  : "Belum disimpan"}
            </span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-70"
            >
              <IoSave />
              {isSaving ? "Saving..." : "Simpan"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
