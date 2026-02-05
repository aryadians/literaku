# Database Setup Instructions

## 🗄️ Running Supabase Migrations

Your database schema is ready in `supabase/schema.sql`. Here's how to apply it:

### Option 1: Via Supabase Dashboard (RECOMMENDED)

1. **Open Supabase Dashboard**
   - Go to: https://oujzaihnpdffjnhfgfks.supabase.co
   - Navigate to **SQL Editor**

2. **Run the schema**
   - Open `supabase/schema.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run**

3. **Verify tables created**
   - Go to **Table Editor**
   - You should see: `profiles`, `categories`, `book_reviews`, `comments`, `review_likes`

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref oujzaihnpdffjnhfgfks

# Run migrations
supabase db push
```

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
