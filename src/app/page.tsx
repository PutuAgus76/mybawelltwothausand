// app/page.tsx — Public site homepage (Server Component)
// Mengambil semua data dari Supabase di server, lalu render client components
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { SiteContentMap, TimelineItem, QuizQuestion, LoveLetter } from '@/lib/types';
import HeroSection from '@/components/public/HeroSection';
import TimelineSection from '@/components/public/TimelineSection';
import QuizSection from '@/components/public/QuizSection';
import LoveLetterSection from '@/components/public/LoveLetterSection';
import Footer from '@/components/public/Footer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_content')
    .select('key, value')
    .in('key', ['hero_title', 'hero_subtitle']);

  const contentMap: SiteContentMap = Object.fromEntries(
    (data ?? []).map((row) => [row.key, row.value ?? ''])
  );

  const title = contentMap['hero_title'] ?? 'Our Love Story 💕';
  const description = contentMap['hero_subtitle'] ?? 'Cerita cinta kita yang indah';

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  };
}

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Site content (hero, footer, dsb)
  const { data: contentRows } = await supabase
    .from('site_content')
    .select('key, value');

  const contentMap: SiteContentMap = Object.fromEntries(
    (contentRows ?? []).map((row) => [row.key, row.value ?? ''])
  );

  // 2. Timeline items
  const { data: timelineItems } = await supabase
    .from('timeline_items')
    .select('*')
    .order('order_index', { ascending: true });

  // 3. Quiz questions + options (join)
  const { data: quizQuestions } = await supabase
    .from('quiz_questions')
    .select('*, options:quiz_options(*)')
    .order('order_index', { ascending: true });

  // Sort options per question
  const questions: QuizQuestion[] = (quizQuestions ?? []).map((q) => ({
    ...q,
    options: (q.options ?? []).sort(
      (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
    ),
  }));

  // 4. Love letter
  const { data: letterRow } = await supabase
    .from('love_letter')
    .select('*')
    .eq('id', 1)
    .single();

  return (
    <main className="min-h-screen">
      <HeroSection content={contentMap} />
      <TimelineSection items={(timelineItems ?? []) as TimelineItem[]} />
      <QuizSection questions={questions} />
      <LoveLetterSection letter={letterRow as LoveLetter | null} />
      <Footer content={contentMap} />
    </main>
  );
}
