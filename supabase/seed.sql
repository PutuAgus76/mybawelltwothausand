-- =============================================================
-- Our Love Story — Seed Data (Data Contoh / Dummy)
-- Semua teks bertanda [Ganti: ...] adalah placeholder —
-- edit via Admin Panel setelah website live.
--
-- Run ini SETELAH migration 001_initial_schema.sql
-- di Supabase Dashboard > SQL Editor
-- =============================================================

-- =============================================================
-- SITE CONTENT (key-value global)
-- =============================================================
INSERT INTO site_content (key, value) VALUES
  ('hero_title',         '[Ganti: Nama Kalian] 💕'),
  ('hero_subtitle',      '[Ganti: Tagline singkat, misal "2 Tahun 10 Bulan Bersama"]'),
  ('hero_counter_start', '[Ganti: Tanggal mulai pacaran, format YYYY-MM-DD, misal 2023-09-15]'),
  ('envelope_message',   '[Ganti: Pesan kejutan di dalam amplop, misal "Hei Sayang, ini untuk kamu..."]'),
  ('signoff_name',       '[Ganti: Nama kamu / pengirim]'),
  ('footer_text',        '[Ganti: Pesan footer, misal "Dibuat dengan ❤️ oleh Nama untuk Nama"]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- =============================================================
-- TIMELINE ITEMS (5 contoh momen — bisa ditambah/kurang dari admin)
-- =============================================================
INSERT INTO timeline_items (order_index, date_label, title, description, photo_url, photo_alt) VALUES
  (
    1,
    '[Ganti: Tanggal momen 1, misal "15 September 2023"]',
    '[Ganti: Judul momen 1, misal "Hari Pertama Kita"]',
    '[Ganti: Cerita singkat momen 1, misal "Hari yang tidak akan pernah aku lupakan. Kamu datang dengan senyum itu dan semuanya berubah."]',
    NULL,
    '[Ganti: Deskripsi foto momen 1 untuk aksesibilitas]'
  ),
  (
    2,
    '[Ganti: Tanggal momen 2, misal "24 Desember 2023"]',
    '[Ganti: Judul momen 2, misal "Malam Natal Pertama"]',
    '[Ganti: Cerita singkat momen 2, misal "Kita duduk berdua di bawah pohon natal, saling bercerita sampai larut malam."]',
    NULL,
    '[Ganti: Deskripsi foto momen 2]'
  ),
  (
    3,
    '[Ganti: Tanggal momen 3, misal "15 Maret 2024"]',
    '[Ganti: Judul momen 3, misal "Perjalanan Pertama Bersama"]',
    '[Ganti: Cerita singkat momen 3, misal "Road trip dadakan yang ternyata jadi salah satu hari terbaik dalam hidupku."]',
    NULL,
    '[Ganti: Deskripsi foto momen 3]'
  ),
  (
    4,
    '[Ganti: Tanggal momen 4, misal "15 September 2024"]',
    '[Ganti: Judul momen 4, misal "Genap Setahun"]',
    '[Ganti: Cerita singkat momen 4, misal "Setahun yang penuh warna. Terima kasih sudah ada."]',
    NULL,
    '[Ganti: Deskripsi foto momen 4]'
  ),
  (
    5,
    '[Ganti: Tanggal momen 5, misal "15 Juli 2026"]',
    '[Ganti: Judul momen 5, misal "Hari Ini — 2 Tahun 10 Bulan"]',
    '[Ganti: Cerita singkat momen 5, misal "Dan masih banyak lagi yang akan kita tulis bersama."]',
    NULL,
    '[Ganti: Deskripsi foto momen 5]'
  );

-- =============================================================
-- QUIZ QUESTIONS + OPTIONS (3 pertanyaan contoh)
-- is_correct = TRUE hanya boleh 1 per pertanyaan
-- =============================================================

-- Pertanyaan 1
WITH q1 AS (
  INSERT INTO quiz_questions (order_index, question) VALUES
    (1, '[Ganti: Pertanyaan 1, misal "Di mana kita pertama kali bertemu?"]')
  RETURNING id
)
INSERT INTO quiz_options (question_id, label, is_correct, order_index)
SELECT id, label, is_correct, order_index FROM q1,
(VALUES
  ('[Ganti: Pilihan A, misal "Di kampus"]',   FALSE, 1),
  ('[Ganti: Pilihan B, misal "Di kafe"]',      TRUE,  2),
  ('[Ganti: Pilihan C, misal "Di rumah teman"]', FALSE, 3),
  ('[Ganti: Pilihan D, misal "Di mall"]',      FALSE, 4)
) AS opts(label, is_correct, order_index);

-- Pertanyaan 2
WITH q2 AS (
  INSERT INTO quiz_questions (order_index, question) VALUES
    (2, '[Ganti: Pertanyaan 2, misal "Apa makanan favorit kita berdua?"]')
  RETURNING id
)
INSERT INTO quiz_options (question_id, label, is_correct, order_index)
SELECT id, label, is_correct, order_index FROM q2,
(VALUES
  ('[Ganti: Pilihan A, misal "Sushi"]',        FALSE, 1),
  ('[Ganti: Pilihan B, misal "Pizza"]',         FALSE, 2),
  ('[Ganti: Pilihan C, misal "Mie Ayam"]',      TRUE,  3),
  ('[Ganti: Pilihan D, misal "Nasi Padang"]',   FALSE, 4)
) AS opts(label, is_correct, order_index);

-- Pertanyaan 3
WITH q3 AS (
  INSERT INTO quiz_questions (order_index, question) VALUES
    (3, '[Ganti: Pertanyaan 3, misal "Lagu apa yang jadi lagu kita?"]')
  RETURNING id
)
INSERT INTO quiz_options (question_id, label, is_correct, order_index)
SELECT id, label, is_correct, order_index FROM q3,
(VALUES
  ('[Ganti: Pilihan A, misal "Pilihan Hati"]',  FALSE, 1),
  ('[Ganti: Pilihan B, misal "Cinta Luar Biasa"]', TRUE, 2),
  ('[Ganti: Pilihan C, misal "Kangen"]',         FALSE, 3),
  ('[Ganti: Pilihan D, misal "Tak Ingin Usai"]', FALSE, 4)
) AS opts(label, is_correct, order_index);

-- =============================================================
-- LOVE LETTER (1 row — paragraf dinamis via JSONB array)
-- =============================================================
INSERT INTO love_letter (id, paragraphs, signoff) VALUES (
  1,
  '[
    "[Ganti: Paragraf 1 surat cinta, misal \"Sayang, kalau kamu baca ini, aku ingin kamu tahu betapa berartinya kamu dalam hidupku.\"]",
    "[Ganti: Paragraf 2, misal \"Setiap hari bersamamu adalah hadiah yang tidak pernah aku bayangkan akan aku dapatkan.\"]",
    "[Ganti: Paragraf 3, misal \"Ada momen susah, ada momen senang — tapi semuanya lebih indah karena ada kamu.\"]",
    "[Ganti: Paragraf 4, misal \"Terima kasih sudah memilih untuk ada. Aku mencintaimu, kemarin, hari ini, dan seterusnya.\"]"
  ]'::JSONB,
  '[Ganti: Tanda tangan / penutup, misal "Dengan seluruh cintaku, Nama Kamu"]'
)
ON CONFLICT (id) DO UPDATE
  SET paragraphs = EXCLUDED.paragraphs,
      signoff = EXCLUDED.signoff;
