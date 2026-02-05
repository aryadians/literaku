import { createClient } from "@/lib/supabase/server";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { IoBook } from "react-icons/io5";

export const metadata = {
  title: "Perpustakaan - Literaku",
  description: "Jelajahi koleksi buku dan ulasan di Literaku.",
};

export default async function LibraryPage() {
  const supabase = await createClient();

  // Fetch all published reviews
  const { data: books, error } = await supabase
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
      categories (
        name,
        slug
      )
    `,
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching library:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <IoBook className="text-brand-600 dark:text-brand-400" />
              Perpustakaan
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Jelajahi koleksi buku yang telah diulas oleh komunitas kami.
              Temukan bacaan favoritmu selanjutnya.
            </p>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!books || books.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <IoBook className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Belum ada buku
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Koleksi buku kami masih kosong saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
            {books.map((book: any) => (
              <Link
                key={book.id}
                href={`/reviews/${book.slug}`}
                className="group block"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-200 dark:bg-gray-800 mb-4 group-hover:-translate-y-1">
                  {book.book_cover_url ? (
                    <Image
                      src={book.book_cover_url}
                      alt={book.book_title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                      <IoBook className="w-12 h-12" />
                    </div>
                  )}
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {book.title}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {book.book_title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {book.book_author}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center text-yellow-500 text-xs sm:text-sm">
                      <FaStar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {book.rating}
                      </span>
                    </div>
                    {book.categories && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
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
  );
}
