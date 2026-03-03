"use client";

import Link from "next/link";
import { IoAlertCircle, IoArrowBack, IoHome } from "react-icons/io5";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "Terjadi kesalahan pada konfigurasi server. Mohon hubungi admin.",
    AccessDenied: "Akses ditolak. Anda tidak memiliki izin untuk masuk.",
    Verification: "Link verifikasi telah kadaluwarsa atau sudah digunakan.",
    Default: "Terjadi kesalahan saat proses autentikasi. Silakan coba lagi.",
  };

  const errorMessage = errorMessages[error as string] || errorMessages.Default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center"
    >
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <IoAlertCircle size={48} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Autentikasi Gagal
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {errorMessage}
      </p>

      <div className="space-y-3">
        <Link href="/auth/login">
          <Button variant="primary" className="w-full">
            <IoArrowBack className="mr-2" /> Kembali ke Login
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="w-full">
            <IoHome className="mr-2" /> Ke Beranda
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
