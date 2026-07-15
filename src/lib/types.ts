// =============================================================
// lib/types.ts — TypeScript interfaces untuk semua tabel Supabase
// =============================================================

export interface SiteContent {
  key: string;
  value: string | null;
  updated_at: string;
}

export interface TimelineItem {
  id: string;
  order_index: number;
  date_label: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  photo_alt: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  order_index: number;
  question: string;
  created_at: string;
  // join: opsi jawaban (diisi saat fetch dengan join)
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  label: string;
  is_correct: boolean;
  order_index: number;
}

export interface LoveLetter {
  id: number;
  paragraphs: string[]; // JSONB array of strings
  signoff: string;
}

// -----------------------------------------------
// Helper: map site_content rows ke Record sederhana
// -----------------------------------------------
export type SiteContentMap = Record<string, string>;
