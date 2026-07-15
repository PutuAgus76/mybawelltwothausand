-- =============================================================
-- Our Love Story — Initial Schema Migration
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================================

-- -----------------------------------------------
-- TABLE: site_content
-- Global key-value store untuk hero, footer, dsb.
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS site_content (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------
-- TABLE: timeline_items
-- Setiap momen/kenangan dalam timeline scrapbook.
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS timeline_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_index  INT NOT NULL DEFAULT 0,
  date_label   TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  photo_url    TEXT,        -- nullable, URL dari Cloudinary
  photo_alt    TEXT,        -- alt text untuk aksesibilitas
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------
-- TABLE: quiz_questions
-- Pertanyaan kuis (jumlah dinamis).
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_index  INT NOT NULL DEFAULT 0,
  question     TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------
-- TABLE: quiz_options
-- Pilihan jawaban per pertanyaan (cascade delete).
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_options (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE,
  order_index  INT NOT NULL DEFAULT 0
);

-- -----------------------------------------------
-- TABLE: love_letter
-- Hanya 1 row (id = 1). Paragraf disimpan sebagai
-- JSONB array sehingga jumlah paragraf dinamis.
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS love_letter (
  id          INT PRIMARY KEY DEFAULT 1,
  paragraphs  JSONB NOT NULL DEFAULT '[]'::JSONB, -- array of strings
  signoff     TEXT NOT NULL DEFAULT ''
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_timeline_order ON timeline_items(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON quiz_questions(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_order ON quiz_options(order_index ASC);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- Publik: hanya SELECT
-- Authenticated (admin): full INSERT / UPDATE / DELETE
-- =============================================================

-- site_content
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_content_public_read"
  ON site_content FOR SELECT
  USING (true);

CREATE POLICY "site_content_admin_write"
  ON site_content FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- timeline_items
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_items_public_read"
  ON timeline_items FOR SELECT
  USING (true);

CREATE POLICY "timeline_items_admin_write"
  ON timeline_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- quiz_questions
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questions_public_read"
  ON quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "quiz_questions_admin_write"
  ON quiz_questions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- quiz_options
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_options_public_read"
  ON quiz_options FOR SELECT
  USING (true);

CREATE POLICY "quiz_options_admin_write"
  ON quiz_options FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- love_letter
ALTER TABLE love_letter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "love_letter_public_read"
  ON love_letter FOR SELECT
  USING (true);

CREATE POLICY "love_letter_admin_write"
  ON love_letter FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================
-- TRIGGER: auto-update updated_at
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timeline_updated_at
  BEFORE UPDATE ON timeline_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
