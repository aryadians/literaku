"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoLibrary, IoPeople, IoReader, IoRocket, IoSparkles, IoStatsChart, IoHeart, IoGlobeOutline } from "react-icons/io5";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  const t = useTranslations("about");
  const tc = useTranslations("common");

  const features = [
    {
      icon: <IoLibrary />,
      title: t("features.items.digitalLibrary.title"),
      description: t("features.items.digitalLibrary.description"),
      color: "bg-brand-50 text-brand-600",
    },
    {
      icon: <IoReader />,
      title: t("features.items.reviewDiscussion.title"),
      description: t("features.items.reviewDiscussion.description"),
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: <IoPeople />,
      title: t("features.items.community.title"),
      description: t("features.items.community.description"),
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: <IoRocket />,
      title: t("features.items.readingHistory.title"),
      description: t("features.items.readingHistory.description"),
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-20">
      {/* Hero Section - Premium Parallax */}
      <section className="relative py-32 lg:py-56 bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop"
            alt="Library"
            fill
            className="object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/80 to-transparent" />
        </div>
        
        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-brand-400"
          >
            <IoSparkles /> {t("title")}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-black mb-8 leading-[0.85] tracking-tighter uppercase italic"
          >
            {tc("appName")} <span className="text-brand-500">Studio</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed italic"
          >
            &quot;{t("slogan")}&quot;
          </motion.p>
        </div>
      </section>

      {/* Vision & Mission - Refined Layout */}
      <section className="py-32 relative">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-3xl border-8 border-gray-50 dark:border-gray-900"
            >
              <Image
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop"
                alt="Community"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-600/40 to-transparent" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="w-16 h-2 bg-brand-600 rounded-full" />
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
                {t("mission.title")}
              </h2>
              <div className="space-y-6 text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                <p className="text-2xl text-gray-900 dark:text-white font-black italic">
                  {t("mission.subtitle")}
                </p>
                <p>{t("mission.description")}</p>
                <div className="flex gap-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-4xl font-black text-brand-600 tracking-tighter">10K+</p>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pembaca</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-indigo-600 tracking-tighter">5K+</p>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Review</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-purple-600 tracking-tighter">1K+</p>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Buku</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid - Bento Modern */}
      <section className="py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-custom">
          <div className="text-center mb-24 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-900 dark:text-white uppercase tracking-tighter italic">
              Kenapa {tc("appName")}?
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium italic">
              {t("features.subtitle")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center group"
              >
                <div className={`mb-8 p-5 rounded-2xl text-3xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${feature.color} dark:bg-gray-800 shadow-sm`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32">
        <div className="container-custom text-center">
          <Card className="bg-gray-900 p-16 md:p-24 rounded-[4rem] text-white relative overflow-hidden shadow-3xl shadow-brand-500/20 max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-purple-600/20" />
            <div className="relative z-10">
              <IoHeart className="text-6xl text-red-500 mx-auto mb-10 animate-pulse" />
              <h2 className="text-4xl md:text-6xl font-black mb-10 leading-[0.9] tracking-tighter uppercase italic">Literasi Adalah <br/> Jantung Peradaban</h2>
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed italic mb-12">
                Kami percaya setiap buku memiliki jiwa, dan setiap pembaca adalah penjaga api pengetahuan. Literaku adalah tempat kita merayakan keduanya.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-brand-400">
                <IoGlobeOutline size={20} /> Membangun Masa Depan Melalui Membaca
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
