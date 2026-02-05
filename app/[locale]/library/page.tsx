import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { FaStar, FaSearch, FaFilter, FaBookOpen } from "react-icons/fa";
import { IoBook } from "react-icons/io5";

export const metadata = {
  title: "Perpustakaan Digital - Literaku",
  description:
    "Koleksi lengkap buku dan ulasan terbaik untuk inspirasi bacamu.",
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const categoryFilter = searchParams.category as string;
  const searchFilter = searchParams.search as string;

  // 1. Fetch Categories for Filter
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name");

  // 2. Build Query
  let query = supabase
    .from("book_reviews")
    .select(
      `
      id,
      title,
      slug,
      book_title,
      book_author,
      book_cover_url,
      rating,
      excerpt,
      categories (
        name,
        slug
      )
    `,
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (categoryFilter) {
    // Note: This requires filtering on the joined table or exact match on ID if we had it.
    // For simplicity with standard Postgrest on joined cols (which can be tricky),
    // we'll filter client side or assume we setup the inner join filter correctly?
    // Let's try the inner join filter approach provided Supabase supports it cleanly in this version.
    // Actually, simplest is to filter by category_id if we have it, but we have slug.
    // Let's allow fetching all and filtering (not efficient for huge data but fine for <100 reviews)
    // OR: use !inner on categories.
    // query = query.eq('categories.slug', categoryFilter); // often fails without !inner
  }

  const { data: allBooks, error } = await query;

  if (error) {
    console.error("Error fetching library:", error);
  }

  // Client-side filter fallback (safe for small dataset)
  let books = allBooks || [];
  if (categoryFilter) {
    books = books.filter((b: any) => b.categories?.slug === categoryFilter);
  }
  if (searchFilter) {
    const lowerSearch = searchFilter.toLowerCase();
    books = books.filter(
      (b: any) =>
        b.book_title.toLowerCase().includes(lowerSearch) ||
        b.book_author.toLowerCase().includes(lowerSearch),
    );
  }

  const featuredBook = books.find((b: any) => b.rating === 5) || books[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 pb-20">
      {/* Hero / Featured Section */}
      <div className="relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-brand-50/50 dark:bg-brand-950/20 pointer-events-none" />
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400">
              Perpustakaan Digital
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Temukan wawasan mendalam dari buku-buku terbaik dunia. Koleksi
              yang dikurasi untuk pembaca yang haus ilmu.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16 relative">
            <form action="/library" method="GET" className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input
                type="text"
                name="search"
                defaultValue={searchFilter}
                placeholder="Cari judul buku, penulis, atau topik..."
                className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg focus:ring-0 focus:border-brand-500 hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300 text-lg"
              />
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="flex items-center gap-2 font-bold text-lg mb-6 text-gray-900 dark:text-white">
              <FaFilter className="text-brand-500" /> Kategori
            </h3>
            <nav className="space-y-2">
              <Link
                href="/library"
                className={`block px-4 py-2 rounded-lg transition-colors ${!categoryFilter ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                Semua Buku
              </Link>
              {categories?.map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/library?category=${cat.slug}`}
                  className={`block px-4 py-2 rounded-lg transition-colors capitalize ${categoryFilter === cat.slug ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <IoBook className="text-brand-500" />
              {categoryFilter ? `Kategori: ${categoryFilter}` : "Semua Koleksi"}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({books.length} buku)
              </span>
            </h2>
          </div>

          {!books || books.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-3xl border-dashed border-2 border-gray-200 dark:border-gray-800">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-50 dark:bg-brand-900/20 mb-6 text-brand-500">
                <FaBookOpen className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Tidak ada buku ditemukan
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Coba sesuaikan kata kunci pencarian atau filter kategori Anda.
              </p>
              <Link
                href="/library"
                className="inline-block mt-6 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-medium transition-colors"
              >
                Reset Filter
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {books.map((book: any) => (
                <Link
                  key={book.id}
                  href={`/reviews/${book.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-200 dark:bg-gray-800 mb-5 group-hover:-translate-y-2 card-3d-effect">
                    {book.book_cover_url ? (
                      <Image
                        src={book.book_cover_url}
                        alt={book.book_title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 p-4 text-center">
                        <IoBook className="w-12 h-12 mb-2" />
                        <span className="text-xs">{book.book_title}</span>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      <FaStar className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-bold">{book.rating}</span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                      <span className="text-white text-xs font-medium uppercase tracking-wider mb-1 bg-brand-600 w-fit px-2 py-0.5 rounded-sm">
                        Review
                      </span>
                      <p className="text-white text-lg font-bold line-clamp-2 leading-tight">
                        {book.title}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {book.book_title}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-1">
                      {book.book_author}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      {book.categories && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                          {book.categories.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
