# Database Setup Instructions

## 🗄️ Running Supabase Migrations

Your database schema is ready in `database/schema.sql`. Here's how to apply it:

### Option 1: Via Supabase Dashboard (RECOMMENDED)

1. **Open Supabase Dashboard**
   - Go to: https://oujzaihnpdffjnhfgfks.supabase.co
   - Navigate to **SQL Editor**

2. **Run the schema**
   - Open `database/schema.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run**

3. **Verify tables created**
   - Go to **Table Editor**
   - You should see: `profiles`, `categories`, `book_reviews`, `comments`, `review_likes`

## 📦 Storage Buckets Setup

To fix the "Bucket not found" error, you must create the following buckets in Supabase Storage:

1. **profiles** (Public: Yes) - For user avatars
2. **canvas-media** (Public: Yes) - For canvas images
3. **library-covers** (Public: Yes) - For book covers
4. **library-books** (Public: Yes) - For PDF files

### How to create:
- Go to **Storage** in Supabase Dashboard.
- Click **New Bucket**.
- Enter the name (e.g., `profiles`) and toggle **Public**.
- Repeat for all 4 buckets.

**Alternatively**, run the script in `database/migrations/setup_storage.sql` in the SQL Editor.

## ✅ Database Schema Created

Your schema includes:

- ✅ **profiles** table - User profiles (extends auth.users)
- ✅ **categories** table - Review categories (Fiction, Non-Fiction, etc.)
- ✅ **book_reviews** table - Main reviews table
- ✅ **comments** table - Review comments
- ✅ **review_likes** table - Review likes/favorites
- ✅ **Row Level Security (RLS)** - Secure access policies
- ✅ **Indexes** - Optimized for performance
- ✅ **Sample data** - 8 categories pre-loaded

## 🎯 Next Steps After Migration

Once database is set up, you can:
1. Test connection via API routes
2. Create sample reviews
3. Build review listing page
4. Implement like/comment functionality

**Status:** Schema ready, waiting for migration execution
