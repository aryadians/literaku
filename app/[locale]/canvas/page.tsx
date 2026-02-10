"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoAdd,
  IoSearch,
  IoTrash,
  IoStar,
  IoTime,
  IoChevronBack,
} from "react-icons/io5";
import CanvasEditor from "@/components/canvas/CanvasEditor";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function CanvasPage() {
  const t = useTranslations("canvas");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, mutate, isLoading } = useSWR("/api/canvas", fetcher);
  const notes = data?.notes || [];

  const filteredNotes = notes.filter((n: any) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const createNote = async () => {
    const res = await fetch("/api/canvas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t("untitled"), content: [] }),
    });
    if (res.ok) {
      const { note } = await res.json();
      mutate();
      setSelectedNoteId(note.id);
    }
  };

  const selectedNote = notes.find((n: any) => n.id === selectedNoteId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container-custom py-8">
        <AnimatePresence mode="wait">
          {!selectedNoteId ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                    {t("title")}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("description")}
                  </p>
                </div>
                <Button
                  onClick={createNote}
                  className="gap-2 shadow-xl shadow-brand-500/20"
                >
                  <IoAdd className="text-xl" /> {t("newNote")}
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-8 max-w-xl">
                <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder={t("search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                />
              </div>

              {/* Notes Grid */}
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-48 bg-gray-100 dark:bg-gray-900 animate-pulse rounded-2xl"
                    />
                  ))}
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                  <div className="text-6xl mb-4">✍️</div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {t("empty.title")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">
                    {t("empty.description")}
                  </p>
                  <Button variant="secondary" onClick={createNote}>
                    {t("empty.cta")}
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredNotes.map((note: any) => (
                    <motion.div
                      key={note.id}
                      whileHover={{ scale: 1.02 }}
                      className="group bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer hover:shadow-xl transition-all"
                      onClick={() => setSelectedNoteId(note.id)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2">
                          {note.title}
                        </h3>
                        {note.is_favorite && (
                          <IoStar className="text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                        <IoTime />
                        {new Date(note.updated_at).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CanvasEditor
                note={selectedNote}
                onBack={() => {
                  setSelectedNoteId(null);
                  mutate();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
