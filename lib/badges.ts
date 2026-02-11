export interface Badge {
  id: string;
  label: string;
  icon: string;
  desc: string;
  criteria: (stats: any) => boolean;
}

export const ALL_BADGES: Badge[] = [
  // --- READING (15) ---
  { id: "read_1", label: "Bibit", icon: "🌱", desc: "Baca 1 buku", criteria: (s) => s.booksRead >= 1 },
  { id: "read_5", label: "Tunas", icon: "🌿", desc: "Baca 5 buku", criteria: (s) => s.booksRead >= 5 },
  { id: "read_10", label: "Pohon", icon: "🌳", desc: "Baca 10 buku", criteria: (s) => s.booksRead >= 10 },
  { id: "read_25", label: "Hutan", icon: "🌲", desc: "Baca 25 buku", criteria: (s) => s.booksRead >= 25 },
  { id: "read_50", label: "Pustakawan", icon: "🧙", desc: "Baca 50 buku", criteria: (s) => s.booksRead >= 50 },
  { id: "read_100", label: "Legenda", icon: "📜", desc: "Baca 100 buku", criteria: (s) => s.booksRead >= 100 },
  { id: "night_owl", label: "Burung Hantu", icon: "🦉", desc: "Baca di malam hari", criteria: (s) => s.booksRead >= 3 },
  { id: "early_bird", label: "Rajin", icon: "🌅", desc: "Baca di pagi hari", criteria: (s) => s.booksRead >= 2 },
  { id: "marathon", label: "Maraton", icon: "🏃", desc: "Selesaikan buku dalam 1 hari", criteria: (s) => s.booksRead >= 7 },
  { id: "scholar", label: "Cendekiawan", icon: "🎓", desc: "Baca 10 kategori berbeda", criteria: (s) => s.categoriesCount >= 10 },
  { id: "history_buff", label: "Sejarawan", icon: "🏛️", desc: "Baca 5 buku Sejarah", criteria: (s) => s.categoriesCount >= 5 },
  { id: "sci_fi", label: "Astronot", icon: "🚀", desc: "Baca 5 buku Sci-Fi", criteria: (s) => s.categoriesCount >= 2 },
  { id: "romance", label: "Pujangga", icon: "💖", desc: "Baca 5 buku Romance", criteria: (s) => s.categoriesCount >= 1 },
  { id: "detective", label: "Detektif", icon: "🔍", desc: "Baca 5 buku Misteri", criteria: (s) => s.categoriesCount >= 1 },
  { id: "expert", label: "Ahli", icon: "🧠", desc: "Selesaikan 1 buku sulit", criteria: (s) => s.booksRead >= 15 },

  // --- REVIEWS (15) ---
  { id: "rev_1", label: "Kritikus Pemula", icon: "✍️", desc: "Tulis 1 review", criteria: (s) => s.reviewsCount >= 1 },
  { id: "rev_5", label: "Penulis", icon: "🖋️", desc: "Tulis 5 review", criteria: (s) => s.reviewsCount >= 5 },
  { id: "rev_10", label: "Jurnalis", icon: "📰", desc: "Tulis 10 review", criteria: (s) => s.reviewsCount >= 10 },
  { id: "rev_25", label: "Redaktur", icon: "👔", desc: "Tulis 25 review", criteria: (s) => s.reviewsCount >= 25 },
  { id: "rev_50", label: "Buku Berjalan", icon: "📖", desc: "Tulis 50 review", criteria: (s) => s.reviewsCount >= 50 },
  { id: "honest", label: "Jujur", icon: "⚖️", desc: "Beri rating 1 bintang", criteria: (s) => s.reviewsCount >= 3 },
  { id: "fanboy", label: "Pemuja", icon: "🙌", desc: "Beri rating 5 bintang 10 kali", criteria: (s) => s.reviewsCount >= 12 },
  { id: "long_winded", label: "Pujangga", icon: "📜", desc: "Review lebih dari 1000 kata", criteria: (s) => s.reviewsCount >= 8 },
  { id: "concise", label: "Singkat", icon: "⚡", desc: "Review padat & jelas", criteria: (s) => s.reviewsCount >= 4 },
  { id: "featured", label: "Bintang", icon: "🌟", desc: "Review dipuji admin", criteria: (s) => s.reviewsCount >= 6 },
  { id: "first_comment", label: "Pertamax", icon: "🥇", desc: "Komentar pertama", criteria: (s) => s.commentsMade >= 1 },
  { id: "debater", label: "Debat", icon: "🗣️", desc: "Balas 10 komentar", criteria: (s) => s.commentsMade >= 10 },
  { id: "helpful", label: "Membantu", icon: "🤝", desc: "Review Anda membantu 10 orang", criteria: (s) => s.likesReceived >= 10 },
  { id: "viral", label: "Viral", icon: "📈", desc: "Review dibaca 1000 kali", criteria: (s) => s.likesReceived >= 20 },
  { id: "influencer", label: "Influencer", icon: "🔥", desc: "Dapat 100 likes", criteria: (s) => s.likesReceived >= 100 },

  // --- SOCIAL & COMMUNITY (10) ---
  { id: "liker", label: "Penyuka", icon: "❤️", desc: "Like 10 review", criteria: (s) => s.commentsMade >= 2 },
  { id: "stalker", label: "Pengintai", icon: "🕵️", desc: "Lihat 50 profil", criteria: (s) => s.likesReceived >= 5 },
  { id: "friendly", label: "Ramah", icon: "👋", desc: "Punya 10 teman", criteria: (s) => s.commentsMade >= 5 },
  { id: "talkative", label: "Cerewet", icon: "💬", desc: "Tulis 50 komentar", criteria: (s) => s.commentsMade >= 50 },
  { id: "supporter", label: "Pendukung", icon: "📣", desc: "Share review ke sosmed", criteria: (s) => s.likesReceived >= 15 },
  { id: "donator", label: "Donatur", icon: "💎", desc: "Dukung platform", criteria: (s) => s.reviewsCount >= 2 },
  { id: "verified", label: "Centang Biru", icon: "✅", desc: "Identitas terverifikasi", criteria: (s) => s.reviewsCount >= 1 },
  { id: "top_contributor", label: "Kontributor", icon: "🏆", desc: "Top 10 bulan ini", criteria: (s) => s.likesReceived >= 50 },
  { id: "paparazzi", icon: "📸", label: "Paparazzi", desc: "Upload foto profil keren", criteria: (s) => s.likesReceived >= 1 },
  { id: "ambassador", icon: "👑", label: "Duta", desc: "Duta Literaku", criteria: (s) => s.likesReceived >= 200 },

  // --- SPECIAL & HIDDEN (10) ---
  { id: "early_adopter", label: "Perintis", icon: "⚓", desc: "Join di tahun pertama", criteria: (s) => true },
  { id: "anniversary", label: "Setia", icon: "🎂", desc: "Sudah join 1 tahun", criteria: (s) => true },
  { id: "perfectionist", label: "Perfeksionis", icon: "🎯", desc: "Lengkapi semua data profil", criteria: (s) => s.reviewsCount >= 1 },
  { id: "dark_mode", label: "Ninja", icon: "🥷", desc: "Gunakan mode gelap", criteria: (s) => true },
  { id: "multi_lingual", label: "Poliglot", icon: "🌐", desc: "Ganti bahasa aplikasi", criteria: (s) => true },
  { id: "treasure_hunter", label: "Pemburu", icon: "🏴‍☠️", desc: "Temukan buku langka", criteria: (s) => s.booksRead >= 3 },
  { id: "collector", label: "Kolektor", icon: "🗃️", desc: "Simpan 20 buku ke wishlist", criteria: (s) => s.booksRead >= 20 },
  { id: "zen_master", label: "Sabar", icon: "🧘", desc: "Baca tanpa henti 2 jam", criteria: (s) => s.booksRead >= 2 },
  { id: "lucky", label: "Hoki", icon: "🍀", desc: "Dapat hadiah giveaway", criteria: (s) => s.likesReceived >= 7 },
  { id: "legend", label: "Dewa", icon: "💎", desc: "Miliki semua lencana", criteria: (s) => s.booksRead >= 100 && s.reviewsCount >= 100 },
];
