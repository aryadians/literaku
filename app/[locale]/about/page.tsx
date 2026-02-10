"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoLibrary, IoPeople, IoReader, IoRocket } from "react-icons/io5";

export default function AboutPage() {
  const t = useTranslations("common");

  const features = [
    {
      icon: <IoLibrary className="w-8 h-8 text-brand-500" />,
      title: "Perpustakaan Digital",
      description:
        "Akses ribuan buku digital dari berbagai genre dan kategori secara gratis dan mudah.",
    },
    {
      icon: <IoReader className="w-8 h-8 text-brand-500" />,
      title: "Review & Diskusi",
      description:
        "Bagikan ulasan Anda, baca pandangan orang lain, dan berdiskusi tentang buku favorit.",
    },
    {
      icon: <IoPeople className="w-8 h-8 text-brand-500" />,
      title: "Komunitas Literasi",
      description:
        "Terhubung dengan sesama pecinta buku, penulis, dan pegiat literasi di seluruh Indonesia.",
    },
    {
      icon: <IoRocket className="w-8 h-8 text-brand-500" />,
      title: "Jejak Bacaan",
      description:
        "Pantau progres membaca Anda dan bangun portofolio literasi pribadi Anda.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative py-20 bg-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="container-custom relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Tentang {t("appName")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-brand-100 max-w-3xl mx-auto"
          >
            {t("slogan")}
          </motion.p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop"
                alt="Reading Community"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Misi Kami
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Literaku hadir dengan visi sederhana namun ambisius:
                <strong>
                  {" "}
                  Mendemokratisasi akses literasi dan membangun budaya membaca
                  yang kuat di Indonesia.
                </strong>
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Kami percaya bahwa buku adalah jendela dunia, dan setiap orang
                berhak mendapatkan akses ke pengetahuan dan hiburan yang
                berkualitas. Melalui teknologi, kami menghubungkan pembaca,
                penulis, dan buku dalam satu ekosistem yang inklusif.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Mengapa Memilih Literaku?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Platform lengkap untuk menunjang perjalanan literasi Anda.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-full w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
