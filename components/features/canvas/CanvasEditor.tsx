"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  IoChevronBack,
  IoTrash,
  IoSave,
  IoImage,
  IoCloudDone,
  IoCloudUpload,
  IoStar,
  IoStarOutline,
  IoAlertCircle,
} from "react-icons/io5";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

interface Block {
  type: "text" | "image";
  content: string;
}

interface Note {
  id: string;
  title: string;
  content: Block[];
  is_favorite: boolean;
  updated_at: string;
  user_id: string;
}

import { createClient } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";


export default function CanvasEditor({
  note,
  onBack,
}: {
  note: Note;
  onBack: () => void;
}) {
  const t = useTranslations("canvas.editor");
  const { data: session } = useSession();
  const [title, setTitle] = useState(note.title);
  const [blocks, setBlocks] = useState<Block[]>(note.content || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(note.is_favorite);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const supabase = createClient(); // Only one initialization here

  const saveNote = useCallback(
    async (auto = false) => {
      if (isSaving) return;
      setIsSaving(true);
      try {
        const response = await fetch(`/api/canvas?id=${note.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content: blocks,
            is_favorite: isFavorite,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save note");
        }

        setLastSaved(new Date());
      } catch (err: any) {
        console.error("Save error:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [note.id, title, blocks, isFavorite],
  );

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      saveNote(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, blocks, isFavorite, saveNote]);

  const addTextBlock = () => {
    setBlocks([...blocks, { type: "text", content: "" }]);
  };

  const handleTextChange = (index: number, val: string) => {
    const newBlocks = [...blocks];
    newBlocks[index].content = val;
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);

    try {
      // Get the correct UUID from profiles first
      const {
        data: { user: sbUser },
      } = await supabase.auth.getUser();
      let userId = sbUser?.id;

      if (!userId && session?.user?.email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", session.user.email)
          .single();
        userId = profile?.id;
      }

      if (!userId) userId = session?.user?.id;

      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
      // Note: We could use profile.id in path if needed for security
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("canvas-media")
        .upload(fileName, file);

      if (uploadError) {
        // Fallback for demo/if bucket missing
        if (uploadError.message.includes("not found")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setBlocks([...blocks, { type: "image", content: base64 }]);
          };
          reader.readAsDataURL(file);
          return;
        }
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("canvas-media").getPublicUrl(fileName);

      setBlocks([...blocks, { type: "image", content: publicUrl }]);
    } catch (err: any) {
      console.error("Upload error:", err);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async () => {
    const result = await Swal.fire({
      title: t("delete"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/canvas?id=${note.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete note");
        }

        onBack();
      } catch (err: any) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      {/* Visual Enhancements: Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      {/* Editor Header */}
      <div className="flex items-center justify-between mb-12 sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl py-4 z-20 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white dark:hover:bg-gray-900 rounded-full transition-colors text-gray-500"
          >
            <IoChevronBack className="text-2xl" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <IoCloudUpload className="animate-pulse" /> {t("saving")}
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1 text-green-500">
                  <IoCloudDone /> Saved at {lastSaved.toLocaleTimeString()}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <IoCloudDone /> All caught up
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-3 rounded-xl transition-all ${isFavorite ? "text-yellow-400 bg-yellow-400/10" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"}`}
          >
            {isFavorite ? (
              <IoStar className="text-xl" />
            ) : (
              <IoStarOutline className="text-xl" />
            )}
          </button>
          <button
            onClick={deleteNote}
            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <IoTrash className="text-xl" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="space-y-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="w-full text-5xl font-black bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-200 dark:placeholder:text-gray-800"
        />

        <div className="space-y-6 relative z-10">
          {blocks.map((block, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all"
            >
              <button
                onClick={() => removeBlock(index)}
                className="absolute -right-4 -top-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
              >
                <IoTrash className="text-sm" />
              </button>

              {block.type === "text" ? (
                <textarea
                  autoFocus
                  value={block.content}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  placeholder={t("placeholder")}
                  className="w-full bg-transparent outline-none text-xl text-gray-700 dark:text-gray-300 min-h-[1.5rem] resize-none leading-relaxed font-serif"
                  rows={block.content.split("\n").length || 1}
                />
              ) : (
                <div className="relative rounded-xl overflow-hidden shadow-inner bg-gray-50 dark:bg-gray-800">
                  <img
                    src={block.content}
                    alt="Canvas element"
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4 pt-8 border-t border-gray-100 dark:border-gray-900">
          <Button
            variant="ghost"
            className="gap-2 rounded-2xl py-6 px-8"
            onClick={addTextBlock}
          >
            <span className="text-2xl font-light">T</span>{" "}
            {t("placeholder").split(" ")[0]}...
          </Button>
          <div className="relative overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button
              variant="ghost"
              className="gap-2 rounded-2xl py-6 px-8 border-2 border-dashed border-gray-200 dark:border-gray-800"
            >
              <IoImage className="text-xl text-brand-500" /> {t("uploadImage")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}