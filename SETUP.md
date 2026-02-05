# Literaku - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd C:\Tugas Kuliah\Belajar\Project\literaku
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file (sudah ada template) dan isi dengan:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Supabase Database

1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file `supabase/schema.sql`
3. Paste dan run di SQL Editor
4. Akan membuat semua tables, indexes, dan policies

### 4. Setup GitHub OAuth (Optional)

1. Buka https://github.com/settings/developers
2. New OAuth App
3. Application name: `Literaku`
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. Copy Client ID dan Client Secret ke `.env.local`

### 5. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Paste hasilnya ke `NEXTAUTH_SECRET` di `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000

## 📁 Project Structure

```
literaku/
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Homepage
│   ├── api/
│   │   └── auth/          # NextAuth endpoints
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── layout/            # Layout components
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── fonts.ts           # Google Fonts
│   ├── supabase.ts        # Supabase client
│   ├── axios.ts           # Axios instance
│   └── utils.ts           # Utility functions
├── messages/              # i18n translations
│   ├── id.json
│   └── en.json
├── store/                 # Zustand stores
│   ├── useAuthStore.ts
│   └── useReviewStore.ts
├── supabase/
│   └── schema.sql         # Database schema
├── i18n.ts               # next-intl config
├── middleware.ts          # Locale routing
└── tailwind.config.ts     # Tailwind configuration
```

## 🎨 Design Tokens

### Colors
- Primary: `brand-500` (#d98943)
- Accent: `accent-500` (#0ea5e9)
- Success: `success-500` (#22c55e)

### Fonts
- UI: Inter (via `--font-inter`)
- Reading: Merriweather (via `--font-merriweather`)

### Animations
- Duration: 200-600ms
- Easing: ease-out, ease-in-out
- Framer Motion untuk complex animations

## 🔑 Key Features

1. **Bilingual Support**: ID/EN via next-intl
2. **Dark Mode Ready**: All components support dark mode
3. **Responsive**: Mobile-first design
4. **Animated**: Framer Motion throughout
5. **Type-Safe**: Full TypeScript coverage
6. **Optimized**: Next.js 14 optimizations

## 🛠️ Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📚 Next Steps

1. ✅ Setup Supabase + GitHub OAuth
2. Build additional pages (reviews, dashboard)
3. Implement authentication flow
4. Add create/edit review functionality
5. Implement comments and likes
6. Add image upload for book covers

## 🐛 Troubleshooting

### Build Errors
- Make sure all env vars are set
- Run `npm install` to ensure all dependencies are installed

### Supabase Connection Issues
- Verify Supabase URL and keys in `.env.local`
- Check if database schema is applied

### GitHub OAuth Not Working
- Verify callback URL matches exactly
- Check Client ID and Secret

## 📞 Support

Jika ada pertanyaan atau issue, refer ke:
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Supabase Docs](https://supabase.com/docs)
