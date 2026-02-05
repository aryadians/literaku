import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const dummyReviews = [
  {
    title: "Harry Potter dan Batu Bertuah",
    book_title: "Harry Potter and the Sorcerer's Stone",
    book_author: "J.K. Rowling",
    book_cover_url:
      "https://m.media-amazon.com/images/I/71RVt35ZAbL._AC_UF1000,1000_QL80_.jpg",
    content: `# Sihir yang Memikat Hati

**Penerbit:** Bloomsbury (1997)
**Genre:** Fantasi

Buku yang memulai segalanya. J.K. Rowling berhasil menciptakan dunia sihir yang begitu detail dan hidup. Kisah Harry, anak yatim piatu yang menemukan bahwa dia adalah penyihir, adalah kisah klasik tentang kebaikan melawan kejahatan.

## Karakter
Pengembangan karakter sangat kuat. Kita tidak hanya peduli pada Harry, tapi juga Ron dan Hermione. Persahabatan mereka terasa tulus dan tumbuh secara alami.

## Kesimpulan
Wajib dibaca oleh siapa saja, tua maupun muda. Ini bukan sekadar buku anak-anak; ini adalah pintu gerbang ke imajinasi tanpa batas.`,
    rating: 5,
    category_slug: "fiction",
  },
  {
    title: "The Alchemist: Sang Alkemis",
    book_title: "The Alchemist",
    book_author: "Paulo Coelho",
    book_cover_url: "https://m.media-amazon.com/images/I/51Z0nLAfLmL.jpg",
    content: `# Mengejar Takdir Pribadi

**Penerbit:** HarperOne (1988)
**Genre:** Fiksi / Filosofi

Kisah sederhana tentang Santiago, seorang gembala Andalusia yang bermimpi menemukan harta karun di piramida Mesir. Namun, perjalanannya mengajarkan bahwa harta yang sesungguhnya adalah pelajaran yang didapat sepanjang jalan.

## Kutipan Favorit
"When you want something, all the universe conspires in helping you to achieve it."

## Review
Bokunya tipis tapi penuh makna. Sangat inspiratif bagi siapa saja yang sedang ragu mengejar mimpinya.`,
    rating: 5,
    category_slug: "fiction",
  },
  {
    title: "Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa",
    book_title: "Atomic Habits",
    book_author: "James Clear",
    book_cover_url: "https://m.media-amazon.com/images/I/81wgcld4wxL.jpg",
    content: `# Sistem, Bukan Sekadar Tujuan

**Penerbit:** Avery (2018)
**Genre:** Self-Help

James Clear menawarkan kerangka kerja yang terbukti untuk meningkatkan kemampuan setiap hari. Buku ini bukan tentang motivasi sesaat, tapi tentang membangun sistem.

## 1% Lebih Baik
Konsep utamanya adalah perbaikan 1% setiap hari. Jika Anda bisa menjadi 1% lebih baik setiap hari selama setahun, Anda akan menjadi 37 kali lebih baik pada akhir tahun.

## Kesimpulan
Sangat praktis dan aplikatif.`,
    rating: 5,
    category_slug: "self-help",
  },
  {
    title: "Start with Why",
    book_title: "Start with Why",
    book_author: "Simon Sinek",
    book_cover_url: "https://m.media-amazon.com/images/I/71vK0WVQ4rL.jpg",
    content: `# Mengapa Beberapa Pemimpin Menginspirasi?

**Penerbit:** Portfolio (2009)
**Genre:** Bisnis / Kepemimpinan

Sinek berargumen bahwa orang tidak membeli "apa" yang Anda lakukan, tapi "mengapa" Anda melakukannya. Dia menggunakan "Golden Circle" (Why, How, What) untuk menjelaskan kesuksesan Apple, Martin Luther King Jr., dan Wright Brothers.

## Review
Buku ini mengubah cara saya memandang pemasaran dan kepemimpinan. Sangat direkomendasikan untuk entrepreneur.`,
    rating: 4,
    category_slug: "business",
  },
  {
    title: "Steve Jobs",
    book_title: "Steve Jobs",
    book_author: "Walter Isaacson",
    book_cover_url: "https://m.media-amazon.com/images/I/71sV+iIEWdL.jpg",
    content: `# Biografi Sang Visioner

**Penerbit:** Simon & Schuster (2011)
**Genre:** Biografi

Buku ini memberikan pandangan yang jujur dan brutal tentang kehidupan Steve Jobs. Isaacson tidak berusaha memoles citra Jobs; dia menampilkan sisi jeniusnya sekaligus sisi temperamentalnya.

## Inovasi
Kita diajak menyelami proses lahirnya produk-produk ikonik: Macintosh, iPod, iPhone, dan iPad. Dedikasi Jobs pada kesempurnaan desain sangat mengagumkan.`,
    rating: 5,
    category_slug: "biography",
  },
  {
    title: "A Brief History of Time",
    book_title: "A Brief History of Time",
    book_author: "Stephen Hawking",
    book_cover_url:
      "https://m.media-amazon.com/images/I/51+GySc8ExL._SY445_SX342_.jpg",
    content: `# Menjelajahi Alam Semesta

**Penerbit:** Bantam Books (1988)
**Genre:** Sains

Stephen Hawking mencoba menjelaskan konsep-konsep kosmologi yang rumit (Big Bang, Black Holes, Light Cones) dengan bahasa yang bisa dimengerti orang awam.

## Kesan
Meskipun "populer", buku ini tetap menantang. Tapi usaha untuk memahaminya sepadan. Membaca ini membuat kita merasa kecil di hadapan alam semesta yang maha luas.`,
    rating: 4,
    category_slug: "science",
  },
  {
    title: "Sapiens: Riwayat Singkat Umat Manusia",
    book_title: "Sapiens",
    book_author: "Yuval Noah Harari",
    book_cover_url: "https://m.media-amazon.com/images/I/713jIoMO3UL.jpg",
    content: `# Sejarah yang Memprovokasi

**Penerbit:** Harvill Secker (2014)
**Genre:** Sejarah / Non-Fiksi

Harari membawa kita berlari melintasi sejarah spesies kita. Bahasannya tentang "Revolusi Kognitif" dan bagaimana fiksi (uang, negara, agama) menyatukan manusia sangat brilian.

## Kritik
Beberapa bagian mungkin terlalu generalisir, tapi sebagai pengantar sejarah makro, buku ini tak tertandingi.`,
    rating: 5,
    category_slug: "history",
  },
  {
    title: "Rich Dad Poor Dad",
    book_title: "Rich Dad Poor Dad",
    book_author: "Robert T. Kiyosaki",
    book_cover_url: "https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg",
    content: `# Melek Finansial

**Penerbit:** Warner Books (1997)
**Genre:** Bisnis / Keuangan

Buku yang wajib dibaca untuk memahami perbedaan aset dan liabilitas. Kiyosaki mengajarkan bahwa menabung saja tidak cukup; kita harus berinvestasi.

## Pelajaran Utama
"Don't work for money; make money work for you."`,
    rating: 4,
    category_slug: "business",
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    book_title: "The Fellowship of the Ring",
    book_author: "J.R.R. Tolkien",
    book_cover_url: "https://m.media-amazon.com/images/I/91jBDaLnqPL.jpg",
    content: `# Epik Fantasi Terbesar

**Penerbit:** Allen & Unwin (1954)
**Genre:** Fantasi

Dunia Middle-earth yang dibangun Tolkien begitu kaya dengan sejarah, bahasa, dan geografi. Perjalanan Frodo membawa Cincin terasa sangat berat dan nyata.

## World Building
Tidak ada penulis lain yang bisa menyaingi detail world-building Tolkien.`,
    rating: 5,
    category_slug: "fiction",
  },
  {
    title: "Educated",
    book_title: "Educated",
    book_author: "Tara Westover",
    book_cover_url: "https://m.media-amazon.com/images/I/81WojUxbbFL.jpg",
    content: `# Kekuatan Pendidikan

**Penerbit:** Random House (2018)
**Genre:** Biografi / Memoar

Kisah nyata Tara Westover yang tumbuh di keluarga survivalist di pegunungan Idaho, tidak pernah sekolah hingga usia 17 tahun, namun akhirnya berhasil meraih gelar PhD dari Cambridge.

## Emosional
Kisah tentang loyalitas keluarga vs keinginan untuk berkembang. Sangat menyentuh.`,
    rating: 5,
    category_slug: "biography",
  },
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    let user = authUser;

    // Bypass auth for seeding script via curl
    if (!user) {
      // Try to get the first user
      const { data: firstUser } = await supabase
        .from("profiles")
        .select("id")
        .limit(1)
        .single();
      if (firstUser) {
        user = { id: firstUser.id } as any;
      } else {
        return NextResponse.json(
          {
            error: "Unauthorized",
            message:
              "TIDAK ADA USER DITEMUKAN. Silakan daftar akun (Register) terlebih dahulu di website agar data dummy bisa dikaitkan ke akun tersebut.",
          },
          { status: 401 },
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const execute = searchParams.get("execute") === "true";

    if (!execute) {
      return NextResponse.json({
        message:
          "Ready to seed 10 reviews. Add ?execute=true param to confirm.",
        count: dummyReviews.length,
        preview: dummyReviews[0],
      });
    }

    // 1. Get Category IDs map
    const { data: categories } = await supabase
      .from("categories")
      .select("id, slug");

    if (!categories)
      return NextResponse.json(
        { error: "No categories found" },
        { status: 500 },
      );

    const catMap = categories.reduce((acc: any, cat: any) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {});

    // 2. Insert Data
    const results = [];
    for (const review of dummyReviews) {
      // Find rough category match or default to Fiction
      let catId = catMap[review.category_slug];
      if (!catId) catId = catMap["fiction"]; // Fallback

      // Create slug
      const slug =
        review.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-") +
        "-" +
        Date.now().toString().slice(-4) +
        Math.floor(Math.random() * 1000);

      const { data, error } = await supabase
        .from("book_reviews")
        .insert({
          user_id: user.id,
          category_id: catId,
          title: review.title,
          slug: slug,
          book_title: review.book_title,
          book_author: review.book_author,
          book_cover_url: review.book_cover_url,
          content: review.content,
          excerpt: review.content.substring(0, 150) + "...",
          rating: review.rating,
          published: true,
          featured: review.rating === 5 && Math.random() > 0.7, // Randomly feature some 5-star books
          views: Math.floor(Math.random() * 500) + 50, // Random views
        })
        .select("id, title");

      results.push({
        title: review.title,
        status: error ? "Failed" : "Success",
        error: error?.message,
      });
    }

    return NextResponse.json({
      message: "Seeding completed",
      results,
    });
  } catch (error) {
    console.error("Seed Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
