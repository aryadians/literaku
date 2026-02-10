"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { IoCamera, IoClose } from "react-icons/io5";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onUpload: (newUrl: string) => void;
  bucketName?: string;
}

export function AvatarUpload({
  currentAvatarUrl,
  onUpload,
  bucketName = "profiles",
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Error", "Ukuran file maksimal 2MB", "error");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      onUpload(publicUrl);
      Swal.fire({
        title: "Berhasil",
        text: "Foto profil berhasil diperbarui",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      Swal.fire("Gagal upload", error.message, "error");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative group w-32 h-32 mx-auto">
      <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gray-200 dark:bg-gray-700 relative">
        {currentAvatarUrl ? (
          <Image
            src={currentAvatarUrl}
            alt="Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
            ?
          </div>
        )}

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Edit Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg transition-transform transform group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        title="Ganti Foto"
        disabled={isUploading}
      >
        <IoCamera className="w-5 h-5" />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
