'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin/hero',     icon: '🏠', label: 'Hero & Footer' },
  { href: '/admin/timeline', icon: '📸', label: 'Timeline' },
  { href: '/admin/quiz',     icon: '❓', label: 'Kuis' },
  { href: '/admin/letter',   icon: '💌', label: 'Surat Cinta' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💕</span>
          <div>
            <p className="font-fraunces text-white font-semibold text-sm leading-tight">Our Love Story</p>
            <p className="font-quicksand text-purple-300 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin navigation">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-white/20 text-white shadow-inner'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-quicksand">{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />}
            </Link>
          );
        })}

        {/* Preview link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-purple-200 hover:bg-white/10 hover:text-white transition-all duration-200 mt-2 border-t border-white/10 pt-4"
        >
          <span className="text-lg">👁️</span>
          <span className="font-quicksand">Preview Site</span>
          <span className="ml-auto text-xs opacity-60">↗</span>
        </a>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-purple-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 disabled:opacity-50"
        >
          <span className="text-lg">🚪</span>
          <span className="font-quicksand">{loggingOut ? 'Keluar...' : 'Keluar'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gradient-to-b from-plum to-purple-900 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger + overlay */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 w-10 h-10 bg-plum text-white rounded-xl flex items-center justify-center shadow-lg"
          aria-label="Buka menu"
        >
          ☰
        </button>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside
          className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-plum to-purple-900 z-50 transform transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-xl"
            aria-label="Tutup menu"
          >
            ✕
          </button>
          <SidebarContent />
        </aside>
      </div>
    </>
  );
}
