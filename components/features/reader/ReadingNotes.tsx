"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { IoClose, IoSave, IoDocumentText, IoSparkles, IoRefresh } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

interface ReadingNotesProps {
  bookSlug: string;
  isOpen: boolean;
  onClose: () => void;
  bookId?: string;
}

export function ReadingNotes({ bookSlug, isOpen, onClose, bookId }: ReadingNotesProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "ai">("notes");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const supabase = createClient();

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("reading_notes")
      .select("content, updated_at")
      .eq("user_id", user.id)
      .eq("book_slug", bookSlug)
      .maybeSingle();

    if (data) {
      setContent(data.content || "");
      setLastSaved(new Date(data.updated_at));
    }
    setIsLoading(false);
  }, [bookSlug, supabase]);

  const handleSave = useCallback(async () => {
    if (!content && !lastSaved) return; // Don't save empty if never saved before
    
    setIsSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsSaving(false);
      return;
    }

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
  }, [bookSlug, content, lastSaved, supabase]);

  const fetchAiSummary = async () => {
    if (!bookId) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
      }
    } catch (e) {
      console.error("Failed to fetch AI summary");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, fetchNotes]);

  useEffect(() => {
    if (activeTab === "ai" && !aiSummary) {
      fetchAiSummary();
    }
  }, [activeTab, aiSummary]);

  // Auto-save every 30s
  useEffect(() => {
    if (!isOpen || !content || activeTab !== "notes") return;
    
    const interval = setInterval(() => {
      handleSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [content, handleSave, isOpen, activeTab]);

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
          {/* Tabs Header */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                activeTab === "notes"
                  ? "text-brand-600 bg-white dark:bg-gray-900 border-b-2 border-brand-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <IoDocumentText size={16} /> Catatan
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                activeTab === "ai"
                  ? "text-purple-600 bg-white dark:bg-gray-900 border-b-2 border-purple-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <IoSparkles size={16} /> Ringkasan AI
            </button>
            <button
              onClick={onClose}
              className="px-4 text-gray-400 hover:text-gray-600"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 relative">
            {activeTab === "notes" ? (
              <>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                ) : (
                  <textarea
                    className="w-full h-full min-h-[400px] resize-none bg-transparent outline-none text-gray-700 dark:text-gray-300 leading-relaxed placeholder:text-gray-400 font-serif text-lg"
                    placeholder="Tulis ide, kutipan, atau pemikiran Anda di sini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                )}
              </>
            ) : (
              <div className="space-y-6">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Gemini sedang merangkum buku untukmu...</p>
                  </div>
                ) : aiSummary ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose dark:prose-invert prose-purple"
                  >
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800 mb-6">
                      <p className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <IoSparkles /> Analisis AI Gemini
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        Ringkasan ini dibuat otomatis oleh kecerdasan buatan untuk membantu Anda memahami inti buku dengan lebih cepat.
                      </p>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-loose font-serif text-lg">
                      {aiSummary}
                    </div>
                    <button 
                      onClick={fetchAiSummary}
                      className="mt-8 flex items-center gap-2 text-xs font-black text-purple-600 uppercase tracking-widest hover:underline"
                    >
                      <IoRefresh /> Perbarui Ringkasan
                    </button>
                  </motion.div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-gray-500 mb-4">Gagal memuat ringkasan AI.</p>
                    <button onClick={fetchAiSummary} className="px-6 py-2 bg-purple-600 text-white rounded-full font-bold">Coba Lagi</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer (Only for Notes) */}
          {activeTab === "notes" && (
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
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
