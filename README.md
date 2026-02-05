
<div align="center">
  <img src="public/logo.png" alt="Literaku Logo" width="120" height="auto" />
  <h1>Literaku</h1>
  
  <p>
    <strong>Platform Perpustakaan Digital & Review Buku Modern</strong>
  </p>

  <p>
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    </a>
    <a href="https://supabase.com">
      <img src="https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com">
      <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    </a>
  </p>

  <p>
    Literaku adalah platform web modern yang menggabungkan pengalaman membaca buku digital (PDF) dengan komunitas review buku yang aktif. Dibangun dengan teknologi terkini untuk performa dan pengalaman pengguna terbaik.
  </p>
</div>

<br />

## ✨ Fitur Unggulan

<table>
  <tr>
    <td width="50%">
      <h3>📚 Perpustakaan Digital</h3>
      <p>Akses ribuan buku digital format PDF secara gratis. Dilengkapi dengan mode baca nyaman (Reader Interface), fitur bookmark, dan catatan pribadi saat membaca.</p>
    </td>
    <td width="50%">
      <h3>✍️ Review & Komunitas</h3>
      <p>Tulis ulasan mendalam tentang buku favoritmu. Berikan rating, komentar, dan like pada ulasan pengguna lain. Bangun reputasi sebagai penikmat literasi.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 Dashboard Personal</h3>
      <p>Pantau statistik membaca dan aktivitas tulisanmu. Lihat grafik views, jumlah likes, dan kelola koleksi review pribadimu dalam satu dashboard terintegrasi.</p>
    </td>
    <td width="50%">
      <h3>🔔 Notifikasi Real-time</h3>
      <p>Dapatkan pemberitahuan instan saat ada yang menyukai atau mengomentari ulasanmu. Sistem notifikasi yang interaktif membuatmu tetap terhubung.</p>
    </td>
  </tr>
</table>

## 🚀 Teknologi

Project ini dibangun menggunakan stack modern:

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [React](https://react.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [React Icons](https://react-icons.github.io/react-icons/)
- **Backend / BaaS**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Data Fetching**: [SWR](https://swr.vercel.app/), [Axios](https://axios-http.com/)

## 🛠️ Instalasi & Setup

Ikuti langkah berikut untuk menjalankan project di lokal:

1.  **Clone Repository**
    ```bash
    git clone https://github.com/aryadians/literaku.git
    cd literaku
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Konfigurasi Environment**
    Buat file `.env.local` dan isi dengan kredensial Supabase Anda:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000
    ```

4.  **Jalankan Development Server**
    ```bash
    npm run dev
    ```

    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📂 Struktur Project

```bash
literaku/
├── app/                  # Next.js App Router
│   ├── [locale]/         # Internationalization routes
│   │   ├── admin/        # Halaman Admin (Upload Buku)
│   │   ├── dashboard/    # User Dashboard
│   │   ├── library/      # Halaman Perpustakaan
│   │   ├── read/         # PDF Reader Interface
│   │   └── reviews/      # Daftar & Detail Review
│   └── api/              # API Routes (Next.js Handlers)
├── components/           # Reusable UI Components
│   ├── layout/           # Header, Footer
│   ├── reader/           # Komponen PDF Reader
│   └── ui/               # Button, Card, Input, dll.
├── lib/                  # Utilities & Helper Functions
├── public/               # Static Assets (Images, Icons)
└── supabase/             # Schema & SQL Migrations
```

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat **Pull Request** atau buka **Issue** jika menemukan bug atau ingin mengajukan fitur baru.

---

<div align="center">
  <p>
    Dibuat dengan ❤️ oleh Tim Literaku
  </p>
  <p>
    &copy; 2026 Literaku. All rights reserved.
  </p>
</div>
