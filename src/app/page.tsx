// app/page.tsx — Public site homepage (Server Component)
// Mengambil semua data dari Supabase di server, lalu render client components
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { SiteContentMap, TimelineItem } from '@/lib/types';
import HeroSection from '@/components/public/HeroSection';
import TimelineSection from '@/components/public/TimelineSection';

export const revalidate = 60; // ISR: revalidate tiap 60 detik

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
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch site content (hero, footer, dsb)
  const { data: contentRows, error: contentError } = await supabase
    .from('site_content')
    .select('key, value');

  const contentMap: SiteContentMap = Object.fromEntries(
    (contentRows ?? []).map((row) => [row.key, row.value ?? ''])
  );

  if (contentError) {
    console.error('Error fetching site_content:', contentError.message);
  }

  // Fetch timeline items (ordered by order_index)
  const { data: timelineItems, error: timelineError } = await supabase
    .from('timeline_items')
    .select('*')
    .order('order_index', { ascending: true });

  if (timelineError) {
    console.error('Error fetching timeline_items:', timelineError.message);
  }

  return (
    <main className="min-h-screen">
      {/* Fase 1: Hero + Timeline */}
      <HeroSection content={contentMap} />
      <TimelineSection items={(timelineItems ?? []) as TimelineItem[]} />

      {/* Placeholder untuk Fase 2: Kuis + Surat Cinta */}
      <section id="coming-soon" className="py-20 text-center bg-gradient-to-br from-purple-50 to-rose-50">
        <p className="font-caveat text-3xl text-purple-800">Kuis & Surat Cinta</p>
        <p className="font-quicksand text-rose-400 mt-2">Segera hadir di Fase 2... 💌</p>
      </section>
    </main>
  );
}
