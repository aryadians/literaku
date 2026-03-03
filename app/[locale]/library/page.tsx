import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { FaStar, FaSearch, FaFilter, FaBookOpen } from "react-icons/fa";
import { IoBook, IoChevronForward, IoCloudUploadOutline, IoSparkles } from "react-icons/io5";
import { AddToCollectionButton } from "@/components/ui/AddToCollectionButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "library" });
  return {
    title: `${t("title")} - Literaku`,
    description: t("hero.description"),
  };
}

export default async function LibraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "library" });
  const supabase = await createClient();
  const session = await getServerSession(authOptions);
  const { category: categoryFilter, search: searchFilter } = await searchParams;

  // 1. Fetch Categories for Filter
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name");

  // 2. Build Query
  let query = supabase.from("books").select(
    `
      *,
      categories (name, slug)
    `,
    { count: "exact" },
  );

  if (categoryFilter) {
    query = query.eq("categories.slug", categoryFilter);
  }

  if (searchFilter) {
    query = query.or(
      `title.ilike.%${searchFilter}%,author.ilike.%${searchFilter}%`,
    );
  }

  const { data: books, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching library:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 pb-20">
      {/* Hero / Featured Section */}
      <div className="relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/30 via-transparent to-transparent dark:from-brand-950/10 pointer-events-none" />
        <div className="container-custom py-16 sm:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-widest mb-6">
              <IoSparkles /> {t("title")}
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-brand-600 to-indigo-600 dark:from-white dark:via-brand-400 dark:to-indigo-400 uppercase italic">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
              {t("hero.description")}
            </p>
          </div>

          {/* Search Bar - Refined */}
          <div className="max-w-2xl mx-auto relative px-4">
            <form action="/library" method="GET" className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input
                type="text"
                name="search"
                defaultValue={searchFilter as string}
                placeholder={t("search.placeholder")}
                className="block w-full pl-14 pr-6 py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-[2rem] shadow-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-500 text-lg font-bold outline-none placeholder:text-gray-400"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/20">
                Cari
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container-custom py-16 flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters - Modern Glassmorphism */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8">
              <h3 className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] mb-8 text-gray-400">
                <FaFilter className="text-brand-500" /> {t("filter.title")}
              </h3>
              <nav className="space-y-2">
                <Link
                  href="/library"
                  className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group ${!categoryFilter ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold"}`}
                >
                  <span>{t("filter.all")}</span>
                  {!categoryFilter && <IoChevronForward />}
                </Link>
                {categories?.map((cat: any) => (
                  <Link
                    key={cat.slug}
                    href={`/library?category=${cat.slug}`}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all capitalize group ${categoryFilter === cat.slug ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold"}`}
                  >
                    <span>{cat.name}</span>
                    {categoryFilter === cat.slug && <IoChevronForward />}
                  </Link>
                ))}
              </nav>

              {/* Admin Action */}
              <div className="mt-10 pt-8 border-t border-gray-50 dark:border-gray-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-center text-gray-400 mb-4">
                  {t("staff.label")}
                </p>
                <Link href="/admin/upload">
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 dark:bg-gray-800 hover:bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 group">
                    <IoCloudUploadOutline className="text-lg group-hover:scale-110 transition-transform" />
                    {t("staff.upload")}
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Promo Card in Sidebar */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <IoSparkles className="w-20 h-20" />
              </div>
              <h4 className="text-xl font-black mb-2 uppercase tracking-tighter italic">Literaku Premium</h4>
              <p className="text-white/70 text-xs font-bold leading-relaxed mb-6">Nikmati akses baca tanpa batas dan fitur AI eksklusif.</p>
              <button className="w-full py-3 bg-white text-indigo-700 rounded-xl font-black uppercase tracking-widest text-[10px]">Cek Paket</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
            <h2 className="text-3xl md:text-4xl font-black flex items-center gap-4 uppercase tracking-tighter italic">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 shadow-sm">
                <IoBook />
              </div>
              {categoryFilter
                ? `${t("main.category")}: ${categoryFilter}`
                : t("main.allCollections")}
            </h2>
            <div className="px-4 py-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs font-black text-gray-400 uppercase tracking-widest">
              {books?.length || 0} {t("main.count")}
            </div>
          </div>

          {!books || books.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] border-dashed border-2 border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gray-50 dark:bg-gray-800 mb-8 text-gray-300">
                <FaBookOpen className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase italic">
                {t("empty.title")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-10 font-medium leading-relaxed">
                {t("empty.description")}
              </p>
              <Link
                href="/admin/upload"
                className="inline-block px-10 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-brand-500/30 transition-all hover:-translate-y-1 active:scale-95"
              >
                {t("empty.cta")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 sm:gap-10">
              {books.map((book: any, i: number) => (
                <div key={book.id} className="group flex flex-col h-full">
                  {/* Book Card - Premium 3D Effect */}
                  <div className="relative mb-6 flex-shrink-0">
                    <Link
                      href={`/read/${book.slug}`}
                      className="relative block aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-700 bg-gray-100 dark:bg-gray-800 group-hover:-translate-y-3 group-hover:rotate-1 border-4 border-white dark:border-gray-800"
                    >
                      {book.cover_url ? (
                        <Image
                          src={book.cover_url}
                          alt={book.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-300">
                          <IoBook className="w-16 h-16 mb-4 opacity-20" />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                            {book.title}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay - Premium */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all delay-100">Baca Sekarang</span>
                        <div className="h-1 w-12 bg-brand-500 rounded-full mb-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all delay-200" />
                      </div>
                    </Link>
                    
                    {/* Add to Collection Button - Glassmorphism Floating */}
                    {session && (
                      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100">
                        <div className="bg-black/20 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/20 dark:border-white/5 shadow-xl">
                          <AddToCollectionButton bookId={book.id} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info - Refined */}
                  <div className="space-y-2 flex-1 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">{book.categories?.name || "Buku"}</span>
                      <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-gray-100 text-xl leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-brand-600 transition-colors uppercase tracking-tighter">
                      <Link href={`/read/${book.slug}`}>{book.title}</Link>
                    </h3>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-auto">
                      {book.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
