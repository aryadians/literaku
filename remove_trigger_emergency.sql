-- 1. HAPUS SEMUA TRIGGER DAN FUNGSI PENYEBAB ERROR
-- Ini akan mematikan otomatisasi yang rusak, supaya Register bisa jalan normal.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user ();

-- 2. Pastikan tabel Profiles siap
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users (id) PRIMARY KEY,
    updated_at TIMESTAMP
    WITH
        TIME ZONE,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        website TEXT,
        bio TEXT
);

-- 3. Cek
SELECT 'Trigger Dihapus. Register sekarang Aman.' as status;