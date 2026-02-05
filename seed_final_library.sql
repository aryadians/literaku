-- Clean up previous attempts if any
DELETE FROM public.book_reviews WHERE title LIKE 'Review: %';

DELETE FROM public.books WHERE slug LIKE '%-pdf';

-- Helper block to insert data
DO $$
DECLARE
  v_admin_id UUID;
  v_cat_fiction UUID;
  v_cat_business UUID;
  v_cat_history UUID;
  v_cat_science UUID;
  v_cat_biography UUID;
  v_cat_selfhelp UUID;
BEGIN
  -- 1. Get Admin User (First found)
  SELECT id INTO v_admin_id FROM profiles LIMIT 1;
  
  -- 2. Get Categories
  SELECT id INTO v_cat_fiction FROM categories WHERE slug = 'fiction' LIMIT 1;
  SELECT id INTO v_cat_business FROM categories WHERE slug = 'business' LIMIT 1;
  SELECT id INTO v_cat_history FROM categories WHERE slug = 'history' LIMIT 1;
  SELECT id INTO v_cat_science FROM categories WHERE slug = 'science' LIMIT 1;
  SELECT id INTO v_cat_biography FROM categories WHERE slug = 'biography' LIMIT 1;
  SELECT id INTO v_cat_selfhelp FROM categories WHERE slug = 'self-help' LIMIT 1;

  -- 3. INSERT BOOKS (PDF Library)
  INSERT INTO public.books (title, slug, author, description, year, category_id, cover_url, pdf_url, uploaded_by)
  VALUES
  ('Atomic Habits', 'atomic-habits-pdf', 'James Clear', 'Perubahan kecil yang memberikan hasil luar biasa.', 2018, v_cat_selfhelp, 'https://m.media-amazon.com/images/I/81wgcld4wxL.jpg', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', v_admin_id),
  ('The Psychology of Money', 'psychology-money-pdf', 'Morgan Housel', 'Pelajaran abadi mengenai kekayaan, ketamakan, dan kebahagiaan.', 2020, v_cat_business, 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', v_admin_id),
  ('Sapiens', 'sapiens-pdf', 'Yuval Noah Harari', 'Riwayat singkat umat manusia.', 2011, v_cat_history, 'https://m.media-amazon.com/images/I/713jIoMO3UL.jpg', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', v_admin_id),
  ('Clean Code', 'clean-code-pdf', 'Robert C. Martin', 'Panduan kode bersih.', 2008, v_cat_science, 'https://m.media-amazon.com/images/I/41xShlnTZTL.jpg', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', v_admin_id),
  ('The Alchemist', 'alchemist-pdf', 'Paulo Coelho', 'Mengejar mimpi.', 1988, v_cat_fiction, 'https://m.media-amazon.com/images/I/51Z0nLAfLmL.jpg', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', v_admin_id),
  ('Rich Dad Poor Dad', 'rich-dad-pdf', 'Robert T. Kiyosaki', 'Pelajaran uang orang kaya.', 1997, v_cat_business, 'https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', v_admin_id),
  ('Thinking, Fast and Slow', 'thinking-fast-pdf', 'Daniel Kahneman', 'Sistem berpikir manusia.', 2011, v_cat_science, 'https://m.media-amazon.com/images/I/61fdrEuPJwL.jpg', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', v_admin_id),
  ('1984', '1984-pdf', 'George Orwell', 'Novel distopia.', 1949, v_cat_fiction, 'https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', v_admin_id),
  ('Harry Potter #1', 'harry-potter-1-pdf', 'J.K. Rowling', 'Petualangan penyihir.', 1997, v_cat_fiction, 'https://m.media-amazon.com/images/I/71-++hbbERL.jpg', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', v_admin_id),
  ('Steve Jobs', 'steve-jobs-pdf', 'Walter Isaacson', 'Biografi pendiri Apple.', 2011, v_cat_biography, 'https://m.media-amazon.com/images/I/71sVqsXSJPL.jpg', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', v_admin_id);

  -- 4. INSERT REVIEWS (Supaya menu "Review" juga penuh)
  INSERT INTO public.book_reviews (user_id, category_id, title, slug, book_title, book_author, book_cover_url, content, excerpt, rating, published)
  VALUES
  (v_admin_id, v_cat_selfhelp, 'Review: Atomic Habits', 'review-atomic-habits', 'Atomic Habits', 'James Clear', 'https://m.media-amazon.com/images/I/81wgcld4wxL.jpg', '# Sangat Bagus\nBuku ini mengubah hidup saya.', 'Perubahan kecil hasil besar.', 5, true),
  (v_admin_id, v_cat_business, 'Review: Psychology of Money', 'review-psychology-money', 'The Psychology of Money', 'Morgan Housel', 'https://m.media-amazon.com/images/I/81Dky+t0X0L.jpg', '# Wajib Baca\nInvestasi bukan cuma angka.', 'Psikologi uang.', 5, true),
  (v_admin_id, v_cat_fiction, 'Review: Harry Potter', 'review-harry-potter', 'Harry Potter', 'J.K. Rowling', 'https://m.media-amazon.com/images/I/71-++hbbERL.jpg', '# Sihir yang Nyata\nSelalu suka buku ini.', 'Dunia sihir.', 5, true),
  (v_admin_id, v_cat_history, 'Review: Sapiens', 'review-sapiens', 'Sapiens', 'Yuval Noah Harari', 'https://m.media-amazon.com/images/I/713jIoMO3UL.jpg', '# Sejarah Manusia\nMembuka wawasan.', 'Sejarah kita.', 4, true);

END $$;

SELECT count(*) as total_books FROM public.books;