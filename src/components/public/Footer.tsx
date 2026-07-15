'use client';

import { motion } from 'framer-motion';
import type { SiteContentMap } from '@/lib/types';

interface FooterProps {
  content: SiteContentMap;
}

// Precomputed static star positions to prevent hydration mismatch
const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${((i * 17 + 7) % 95) + 2}%`,
  top: `${((i * 23 + 13) % 85) + 5}%`,
  fontSize: `${(i % 5) * 2 + 8}px`,
  duration: 2 + (i % 4) * 0.7,
  delay: (i % 3) * 0.6,
}));

export default function Footer({ content }: FooterProps) {
  const footerText = content['footer_text'] ?? 'Dibuat dengan ❤️ untuk kamu';

  return (
    <footer className="relative py-16 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900 via-plum to-purple-800" aria-hidden="true" />

      {/* Stars decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {STARS.map((star) => (
          <motion.span
            key={star.id}
            className="absolute text-white opacity-20"
            style={{
              left: star.left,
              top: star.top,
              fontSize: star.fontSize,
            }}
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
          >
            ✦
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="font-caveat text-3xl text-rose-300 mb-4">💕</p>
          <p className="font-caveat text-xl text-amber-200 leading-relaxed mb-6">
            {footerText}
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent mb-6" />
          <p className="font-quicksand text-xs text-purple-300/60">
            Our Love Story · {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
