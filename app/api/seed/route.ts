import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const dummyBooksData = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
    description: "Perubahan kecil yang memberikan hasil luar biasa.",
    category: "Self-Help",
    cover_url: "https://m.media-amazon.com/images/I/81wgcld4wxL.jpg",
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    year: 2020,
    description:
      "Pelajaran abadi mengenai kekayaan, ketamakan, dan kebahagiaan.",
    category: "Business",
    cover_url: "https://m.media-amazon.com/images/I/81Dky+t0X0L.jpg",
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    year: 2011,
    description: "Riwayat singkat umat manusia dari zaman batu hingga abad 21.",
    category: "History",
    cover_url: "https://m.media-amazon.com/images/I/713jIoMO3UL.jpg",
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    year: 2008,
    description: "Panduan untuk menulis kode yang bersih dan mudah dipelihara.",
    category: "Science",
    cover_url: "https://m.media-amazon.com/images/I/41xShlnTZTL.jpg",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    year: 1988,
    description: "Novel tentang mengejar mimpi dan mendengarkan kata hati.",
    category: "Fiction",
    cover_url: "https://m.media-amazon.com/images/I/51Z0nLAfLmL.jpg",
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    year: 1997,
    description:
      "Apa yang diajarkan orang kaya pada anak-anak mereka tentang uang.",
    category: "Business",
    cover_url: "https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg",
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    year: 2011,
    description:
      "Dua sistem berpikir yang mengendalikan penilaian dan keputusan kita.",
    category: "Non-Fiction",
    cover_url: "https://m.media-amazon.com/images/I/61fdrEuPJwL.jpg",
  },
  {
    title: "1984",
    author: "George Orwell",
    year: 1949,
    description: "Novel distopia klasik tentang pengawasan pemerintah.",
    category: "Fiction",
    cover_url: "https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg",
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    year: 1997,
    description: "Petualangan pertama Harry Potter di dunia sihir.",
    category: "Fiction",
    cover_url: "https://m.media-amazon.com/images/I/71-++hbbERL.jpg",
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    year: 2011,
    description: "Biografi eksklusif pendiri Apple, Steve Jobs.",
    category: "Biography",
    cover_url: "https://m.media-amazon.com/images/I/71sVqsXSJPL.jpg",
  },
];

const SAMPLE_PDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Get User (Admin)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    let userId = authUser?.id;

    if (!userId) {
      // Fallback to first profile if running without auth context (e.g. from curl)
      const { data: firstProfile } = await supabase
        .from("profiles")
        .select("id")
        .limit(1)
        .single();
      if (firstProfile) userId = firstProfile.id;
      else
        return NextResponse.json({ error: "No users found" }, { status: 400 });
    }

    // 2. Get Categories Map
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name");
    const catMap: Record<string, string> = {};
    categories?.forEach((c) => {
      catMap[c.name] = c.id;
    });

    // 3. Insert Books (PDF Library)
    const booksPayload = dummyBooksData.map((b) => ({
      title: b.title,
      slug: b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      author: b.author,
      description: b.description,
      year: b.year,
      category_id: catMap[b.category] || categories?.[0]?.id,
      cover_url: b.cover_url,
      pdf_url: SAMPLE_PDF,
      uploaded_by: userId,
    }));

    const { error: bookError } = await supabase
      .from("books")
      .upsert(booksPayload, { onConflict: "slug" });

    // 4. Insert Reviews (Linked to books conceptually, separate table)
    // We'll also seed reviews for these books so "Semua Review" is not empty
    const reviewsPayload = dummyBooksData.map((b) => ({
      user_id: userId,
      title: `Review: ${b.title}`,
      slug: `review-${b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      book_title: b.title,
      book_author: b.author,
      book_cover_url: b.cover_url,
      category_id: catMap[b.category] || categories?.[0]?.id,
      rating: 5,
      content: `
# Review ${b.title}

Buku **${b.title}** karya ${b.author} adalah bacaan yang sangat direkomendasikan.

**Publisher:** Penerbit Dummy
**Tahun:** ${b.year}

## Sinopsis
${b.description}

## Pendapat Saya
Buku ini memberikan wawasan yang sangat dalam. Penulis berhasil menyampaikan gagasan kompleks dengan bahasa yang mudah dipahami. Sangat cocok untuk dibaca di waktu santai maupun untuk studi serius.

Sangat merekomendasikan buku ini untuk siapa saja yang tertarik dengan topik ${b.category}.
        `,
      excerpt: b.description,
      published: true,
    }));

    const { error: reviewError } = await supabase
      .from("book_reviews")
      .upsert(reviewsPayload, { onConflict: "slug" });

    if (bookError || reviewError) {
      return NextResponse.json({
        success: false,
        bookError: bookError?.message,
        reviewError: reviewError?.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: "10 Books & 10 Reviews seeded successfully!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
