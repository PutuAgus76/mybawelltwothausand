// app/admin/layout.tsx — Admin layout dengan sidebar
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: { default: 'Admin — Our Love Story', template: '%s | Admin' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Guard: pastikan sudah login (proxy.ts juga cek, ini double-check di layout)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top padding for mobile hamburger */}
        <div className="lg:hidden h-16" />
        <main className="flex-1 p-6 lg:p-8 max-w-5xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
