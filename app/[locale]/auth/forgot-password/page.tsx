"use client";

import Link from "next/link";
import { IoArrowBack, IoMail } from "react-icons/io5";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending reset link
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
      >
        <Link
          href="/auth/login"
          className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors mb-8"
        >
          <IoArrowBack /> Kembali ke Login
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Lupa Kata Sandi?
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Masukkan email Anda dan kami akan mengirimkan instruksi untuk mengatur ulang kata sandi.
        </p>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                type="email"
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<IoMail className="text-gray-400" />}
              />
            </div>
            <Button type="submit" variant="primary" className="w-full py-6">
              Kirim Link Reset
            </Button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoMail size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Email Terkirim!
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Jika akun dengan email <strong>{email}</strong> terdaftar, Anda akan menerima link untuk mengatur ulang kata sandi.
            </p>
            <Button
              variant="outline"
              className="mt-8 w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Coba email lain
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
