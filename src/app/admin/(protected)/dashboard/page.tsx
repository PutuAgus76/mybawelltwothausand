export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const admin = await createAdminClient();

  // Fetch quick stats
  const [
    { count: timelineCount },
    { count: quizCount },
  ] = await Promise.all([
    admin.from('timeline_items').select('*', { count: 'exact', head: true }),
    admin.from('quiz_questions').select('*', { count: 'exact', head: true }),
  ]);

  const cards = [
    {
      icon: '🏠',
      label: 'Hero & Footer',
      desc: 'Edit judul, tagline, dan pesan amplop',
      href: '/admin/hero',
      badge: 'Site Content',
    },
    {
      icon: '📸',
      label: 'Timeline Manager',
      desc: 'Kelola momen kenangan & upload foto',
      href: '/admin/timeline',
      badge: `${timelineCount ?? 0} Momen`,
    },
    {
      icon: '❓',
      label: 'Quiz Manager',
      desc: 'Kelola pertanyaan & opsi jawaban kuis',
      href: '/admin/quiz',
      badge: `${quizCount ?? 0} Pertanyaan`,
    },
    {
      icon: '💌',
      label: 'Surat Cinta',
      desc: 'Edit paragraf & tanda tangan surat cinta',
      href: '/admin/letter',
      badge: 'Surat',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fraunces text-3xl text-gray-800">
          Selamat Datang di Admin Panel 💕
        </h1>
        <p className="font-quicksand text-sm text-gray-500 mt-1">
          Kelola seluruh isi website anniversary kalian secara dinamis dari sini.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-rose-200 transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{item.icon}</span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full font-quicksand">
                  {item.badge}
                </span>
              </div>
              <h2 className="font-fraunces text-xl text-gray-800 group-hover:text-rose-600 transition-colors">
                {item.label}
              </h2>
              <p className="font-quicksand text-sm text-gray-500 mt-1">
                {item.desc}
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-rose-500 group-hover:translate-x-1 transition-transform font-quicksand">
              Kelola →
            </div>
          </Link>
        ))}
      </div>

      {/* Live Preview Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-fraunces text-xl">Lihat Hasil Perubahan</h3>
          <p className="font-quicksand text-sm text-purple-100 mt-1">
            Buka halaman utama publik di tab baru untuk mengecek hasil update secara langsung.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-white text-plum rounded-xl font-semibold text-sm font-quicksand hover:bg-rose-50 transition-colors flex-shrink-0"
        >
          👁️ Buka Preview Site ↗
        </a>
      </div>
    </div>
  );
}
