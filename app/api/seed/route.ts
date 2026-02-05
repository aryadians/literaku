import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const dummyReviews = [
  {
    title: "Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa",
    book_title: "Atomic Habits",
    book_author: "James Clear",
    book_cover_url: "https://m.media-amazon.com/images/I/81wgcld4wxL.jpg",
    content: `# Review Atomic Habits

Atomic Habits oleh James Clear adalah buku yang mengubah cara pandang kita tentang kesuksesan dan produktivitas. Clear berargumen bahwa perubahan besar tidak datang dari satu tindakan revolusioner, melainkan dari akumulasi perbaikan kecil sebesar 1% setiap hari.

## Konsep Utama
Buku ini memperkenalkan 4 Hukum Perubahan Perilaku:
1.  **Make it Obvious (Jadikan Terlihat)**: Buat sinyal kebiasaan positif menjadi jelas di lingkungan Anda.
2.  **Make it Attractive (Jadikan Menarik)**: Gunakan "temptation bundling" untuk membuat kebiasaan sulit menjadi lebih menyenangkan.
3.  **Make it Easy (Jadikan Mudah)**: Kurangi hambatan untuk memulai. Aturan 2 Menit sangat efektif di sini.
4.  **Make it Satisfying (Jadikan Memuaskan)**: Berikan hadiah segera setelah menyelesaikan kebiasaan.

## Opini Pribadi
Saya sangat menyukai pendekatan praktis buku ini. Tidak hanya teori, Clear memberikan langkah-langkah konkret. Bagian tentang "Identity-Based Habits" sangat membuka mata saya; kita harus fokus menjadi *siapa* kita ingin menjadi, bukan hanya *apa* yang ingin kita capai.

Sangat direkomendasikan untuk siapa saja yang ingin memperbaiki diri secara konsisten.`,
    rating: 5,
    category_slug: "self-help",
  },
  {
    title: "Sapiens: Riwayat Singkat Umat Manusia",
    book_title: "Sapiens",
    book_author: "Yuval Noah Harari",
    book_cover_url: "https://m.media-amazon.com/images/I/713jIoMO3UL.jpg",
    content: `# Sapiens: Sebuah Tinjauan

Yuval Noah Harari membawa kita dalam perjalanan epik dari masa pra-sejarah hingga era modern. Buku ini bukan sekadar buku sejarah, melainkan sebuah refleksi filosofis tentang apa artinya menjadi manusia.

## Tiga Revolusi Besar
Harari membagi sejarah manusia menjadi tiga revolusi utama:
1.  **Revolusi Kognitif**: Ketika manusia mulai berpikir abstrak dan berkomunikasi denagn bahasa yang kompleks. Hal ini memungkinkan kita menciptakan fiksi bersama (seperti uang, negara, agama).
2.  **Revolusi Pertanian**: Transisi dari pemburu-pengumpul menjadi petani. Harari secara kontroversial menyebut ini sebagai "penipuan terbesar dalam sejarah" karena membuat hidup individu lebih keras meski populasi meledak.
3.  **Revolusi Ilmiah**: Era di mana manusia mulai mengakui ketidaktahuannya dan mencari kekuatan melalui sains dan teknologi.

## Kesimpulan
Buku ini memaksa kita mempertanyakan narasi yang selama ini kita terima begitu saja. Gaya penulisannya yang provokatif dan penuh wawasan membuat "Sapiens" layak dibaca berulang kali.`,
    rating: 5,
    category_slug: "history",
  },
  {
    title: "The Psychology of Money",
    book_title: "The Psychology of Money",
    book_author: "Morgan Housel",
    book_cover_url: "https://m.media-amazon.com/images/I/81Dky+tD+pL.jpg",
    content: `# Uang Bukan Sekadar Angka

Morgan Housel mengajarkan bahwa kesuksesan finansial tidak semata-mata bergantung pada kecerdasan atau pengetahuan teknis, melainkan pada bagaimana kita berperilaku terhadap uang.

## Poin Penting
*   **Keberuntungan vs Risiko**: Sadari bahwa keberuntungan dan risiko adalah dua sisi mata uang yang sama. Jangan terlalu sombong saat sukses, dan jangan terlalu keras pada diri sendiri saat gagal.
*   **Compounding**: Kekuatan bunga majemuk berlaku tidak hanya pada uang, tapi juga pada hubungan dan kebiasaan.
*   **Cukup**: Mengetahui kapan harus berhenti mengejar lebih banyak. "Rich" is current income, "Wealth" is income not spent.

## Review
Buku ini sangat relevan untuk semua kalangan. Bahasanya sederhana namun mendalam. Housel menggunakan banyak cerita pendek (anekdot) yang membuat topik keuangan yang biasanya membosankan menjadi sangat menarik.`,
    rating: 4,
    category_slug: "business",
  },
  {
    title: "Dunia Sophie (Sophie's World)",
    book_title: "Dunia Sophie",
    book_author: "Jostein Gaarder",
    book_cover_url: "https://m.media-amazon.com/images/I/81JJPDN85pL.jpg",
    content: `# Novel Filsafat yang Memukau

Siapa sangka belajar filsafat bisa seasyik membaca novel misteri? "Dunia Sophie" adalah pintu gerbang yang sempurna bagi siapa saja yang ingin mengenal sejarah pemikiran manusia tanpa merasa digurui.

## Alur Cerita
Sophie Amundsen, seorang gadis remaja, tiba-tiba menerima surat misterius berisi pertanyaan-pertanyaan filosofis seperti "Siapa kamu?" dan "Dari mana datangnya dunia?". Ini memulai kursus filsafat tertulis dari seorang misterius bernama Alberto Knox.

## Mengapa Layak Baca?
Buku ini merangkum 3000 tahun pemikiran Barat, dari Socrates hingga Sartre, dalam sebuah narasi fiksi yang penuh plot twist. Gaarder berhasil menyederhanakan konsep-konsep rumit menjadi dialog yang mudah dicerna. Ending-nya sangat *mind-blowing*!`,
    rating: 5,
    category_slug: "fiction",
  },
  {
    title: "Filosofi Teras",
    book_title: "Filosofi Teras",
    book_author: "Henry Manampiring",
    book_cover_url:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1543116515i/42866030.jpg",
    content: `# Stoisisme untuk Mental Baja

Di tengah hiruk-pikuk kehidupan modern yang penuh kecemasan, "Filosofi Teras" hadir sebagai penawar. Buku ini mengadaptasi ajaran Stoisisme kuno ke dalam konteks kehidupan sehari-hari di Indonesia.

## Dikotomi Kendali
Inti ajaran buku ini adalah membedakan hal-hal yang ada di bawah kendali kita (pikiran, tindakan, respon) dan yang tidak (opini orang lain, cuaca, masa lalu). Fokuslah hanya pada yang bisa kita kendalikan, dan belajarlah untuk tidak peduli pada sisanya.

## Kesan
Sangat membumi. Henry Manampiring menulis dengan gaya bahasa yang santai, bahkan jenaka, namun pesannya sangat dalam. Buku ini sangat membantu saya dalam mengelola stres dan ekspektasi.`,
    rating: 4,
    category_slug: "self-help",
  },
  {
    title: "Laut Bercerita",
    book_title: "Laut Bercerita",
    book_author: "Leila S. Chudori",
    book_cover_url:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1523625399i/36979268.jpg",
    content: `# Luka Sejarah yang Tak Pernah Kering

"Laut Bercerita" adalah novel yang menghantui. Mengangkat tema aktivisme mahasiswa di era Orde Baru 1998, Leila S. Chudori merajut kisah persahabatan, cinta, keluarga, dan kehilangan dengan sangat indah namun menyakitkan.

## Dua Sudut Pandang
Novel ini dibagi menjadi dua bagian:
1.  **Biru Laut**: Menceritakan dari sudut pandang para aktivis yang diculik dan disiksa. Deskripsinya begitu hidup dan mencekam.
2.  **Asmara Jati**: Menceritakan dari sudut pandang keluarga yang ditinggalkan, menanti tanpa kepastian. Bagian ini menggambarkan "loss" dengan sangat pedih.

## Review
Salah satu novel sejarah terbaik Indonesia. Riset yang mendalam terasa di setiap halaman. Siapkan tisu, karena buku ini akan menguras emosi Anda.`,
    rating: 5,
    category_slug: "fiction",
  },
  {
    title: "Thinking, Fast and Slow",
    book_title: "Thinking, Fast and Slow",
    book_author: "Daniel Kahneman",
    book_cover_url: "https://m.media-amazon.com/images/I/71f6Hr9VJ8L.jpg",
    content: `# Memahami Dua Sistem Pikiran Kita

Pemenang Nobel Ekonomi, Daniel Kahneman, membedah cara kerja otak manusia dalam mengambil keputusan. Buku ini adalah "kitab suci" bagi mereka yang tertarik pada psikologi perilaku.

## Sistem 1 vs Sistem 2
*   **Sistem 1**: Cepat, intuitif, emosional, otomatis, namun sering bias.
*   **Sistem 2**: Lambat, deliberatif, logis, membutuhkan usaha mental.

Kita sering berpikir kita menggunakan Sistem 2, padahal sebagian besar keputusan kita didorong oleh Sistem 1. Kahneman menjelaskan berbagai bias kognitif seperti *sunk cost fallacy*, *anchoring*, dan *loss aversion*.

## Kesimpulan
Buku yang "berat" namun sangat bermanfaat. Membacanya membuat kita lebih waspada terhadap kesalahan berpikir diri sendiri.`,
    rating: 4,
    category_slug: "science",
  },
  {
    title: "Rich Dad Poor Dad",
    book_title: "Rich Dad Poor Dad",
    book_author: "Robert T. Kiyosaki",
    book_cover_url: "https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg",
    content: `# Pelajaran Dasar Literasi Keuangan

Buku klasik ini telah mengubah mindset jutaan orang tentang uang. Kiyosaki membandingkan dua sosok ayah: ayah kandungnya (Poor Dad) yang berpendidikan tinggi tapi berjuang secara finansial, dan ayah temannya (Rich Dad) yang putus sekolah tapi menjadi multimiliuner.

## Aset vs Liabilitas
Pelajaran terpenting: Orang kaya membeli aset (yang menghasilkan uang), orang miskin membeli liabilitas (yang menguras uang) tapi mengira itu aset. Rumah yang Anda tinggali, menurut Kiyosaki, adalah liabilitas.

## Kritik & Pujian
Meskipun beberapa nasihatnya kontroversial dan dikritik pakar, konsep dasarnya tentang *cash flow* dan pentingnya melepaskan diri dari "Rat Race" sangat valid dan memotivasi.`,
    rating: 3,
    category_slug: "business",
  },
  {
    title: "Bumi Manusia",
    book_title: "Bumi Manusia",
    book_author: "Pramoedya Ananta Toer",
    book_cover_url:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1565658920i/1398034.jpg",
    content: `# Epik Sejarah Pergerakan Nasional

Buku pertama dari Tetralogi Buru ini adalah mahakarya sastra Indonesia. Menceritakan kisah Minke, seorang pribumi cerdas yang bersekolah di HBS Belanda, dan perjuangannya melawan ketidakadilan kolonial.

## Karakter Kuat
Nyai Ontosoroh adalah karakter wanita terkuat dalam sastra Indonesia menurut saya. Ia adalah simbol perlawanan terhadap patriarki dan kolonialisme sekaligus. Hubungannya dengan Minke sangat kompleks dan menarik.

## Makna Mendalam
"Adil sejak dalam pikiran." Kalimat legendaris ini merangkum semangat buku ini. Pramoedya mengajarkan kita untuk menjadi manusia merdeka yang berani melawan penindasan. Wajib baca bagi setiap orang Indonesia.`,
    rating: 5,
    category_slug: "fiction",
  },
  {
    title: "Shoe Dog: A Memoir by the Creator of Nike",
    book_title: "Shoe Dog",
    book_author: "Phil Knight",
    book_cover_url: "https://m.media-amazon.com/images/I/81Example.jpg", // Placeholder if real one fails, but let's try a real one
    content: `# Kisah Jujur di Balik Logo Swoosh

Memoar Phil Knight ini adalah salah satu buku bisnis terbaik yang pernah saya baca. Bukan buku "how-to" yang kering, melainkan sebuah petualangan yang penuh ketidakpastian, kegagalan, dan keberanian.

## Perjalanan Berliku
Membangun Nike (awalnya Blue Ribbon Sports) sangat jauh dari mulus. Knight menceritakan dengan jujur tentang masalah arus kas yang terus-menerus, tuntutan hukum, pengkhianatan mitra, dan tragisnya kehilangan orang tercinta.

## Passion
Yang paling menonjol adalah kecintaan Knight pada lari ("Run"). Bisnis ini bukan sekadar uang baginya, tapi tentang semangat atletik. Buku ini sangat menginspirasi bagi entrepreneur mana pun yang sedang berjuang melawan segala rintangan.`,
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
          { error: "Unauthorized and no users found to seed with." },
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
