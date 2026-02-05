"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  IoBook,
  IoLogoGithub,
  IoMail,
  IoLockClosed,
  IoPerson,
} from "react-icons/io5";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (error) {
        setErrors({ general: error.message });
        return;
      }

      if (data.user) {
        // Auto login after registration
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          // Registration success but login failed, redirect to login
          router.push("/auth/login?registered=true");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setErrors({ general: "Terjadi kesalahan. Silakan coba lagi." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubRegister = async () => {
    setIsLoading(true);
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500 mb-4"
            whileHover={{ scale: 1.1, rotate: -10 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <IoBook className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("registerTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("registerSubtitle")}
          </p>
        </div>

        <Card>
          <Card.Content className="p-8">
            <form onSubmit={handleRegister} className="space-y-4">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                >
                  {errors.general}
                </motion.div>
              )}

              <Input
                type="text"
                label={t("name")}
                placeholder={t("namePlaceholder")}
                value={formData.name}
                onChange={handleChange("name")}
                error={errors.name}
                icon={<IoPerson />}
                required
              />

              <Input
                type="email"
                label={t("email")}
                placeholder={t("emailPlaceholder")}
                value={formData.email}
                onChange={handleChange("email")}
                error={errors.email}
                icon={<IoMail />}
                required
              />

              <Input
                type="password"
                label={t("password")}
                placeholder={t("passwordPlaceholder")}
                value={formData.password}
                onChange={handleChange("password")}
                error={errors.password}
                icon={<IoLockClosed />}
                required
              />

              <Input
                type="password"
                label={t("confirmPassword")}
                placeholder={t("passwordPlaceholder")}
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={errors.confirmPassword}
                icon={<IoLockClosed />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                {t("registerButton")}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t("or")}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGithubRegister}
              disabled={isLoading}
            >
              <IoLogoGithub className="w-5 h-5" />
              {t("loginWithGithub")}
            </Button>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {t("haveAccount")}{" "}
              <Link
                href="/auth/login"
                className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                {t("loginLink")}
              </Link>
            </p>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
}
