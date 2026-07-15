import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin 💕</h1>
            <p className="text-gray-500 mt-1">Our Love Story — Panel Pengelola Konten</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Keluar
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🏠', label: 'Hero & Footer', desc: 'Edit judul, tagline, pesan amplop', href: '/admin/hero' },
            { icon: '📸', label: 'Timeline Manager', desc: 'Tambah/edit/hapus momen kenangan', href: '/admin/timeline' },
            { icon: '❓', label: 'Kuis Manager', desc: 'Kelola pertanyaan & pilihan jawaban', href: '/admin/quiz' },
            { icon: '💌', label: 'Surat Cinta', desc: 'Edit paragraf & tanda tangan surat', href: '/admin/letter' },
            { icon: '👁️', label: 'Preview Site', desc: 'Lihat tampilan publik di tab baru', href: '/', target: '_blank' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.target}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-rose-200 transition-all duration-200 group"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h2 className="font-semibold text-gray-800 group-hover:text-rose-600 transition-colors">{item.label}</h2>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </a>
          ))}
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>💡 Admin panel sedang dalam pengembangan (Fase 3).</strong> Saat ini kamu bisa lihat preview public site dengan klik &ldquo;Preview Site&rdquo; di atas.
        </div>
      </div>
    </div>
  );
}
