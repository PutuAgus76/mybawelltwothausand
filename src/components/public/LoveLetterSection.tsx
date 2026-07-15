'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import type { LoveLetter } from '@/lib/types';

interface LoveLetterSectionProps {
  letter: LoveLetter | null;
}

export default function LoveLetterSection({ letter }: LoveLetterSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const paragraphs: string[] = letter?.paragraphs ?? [
    'Sayang, kalau kamu baca ini, aku ingin kamu tahu betapa berartinya kamu dalam hidupku.',
    'Setiap hari bersamamu adalah hadiah yang tidak pernah aku bayangkan akan aku dapatkan.',
    'Ada momen susah, ada momen senang — tapi semuanya lebih indah karena ada kamu.',
    'Terima kasih sudah memilih untuk ada. Aku mencintaimu, kemarin, hari ini, dan seterusnya.',
  ];
  const signoff = letter?.signoff ?? 'Dengan seluruh cintaku, ❤';

  // Animasi unfold: surat terbuka dari atas ke bawah (3 lipatan)
  const foldVariants = {
    folded: { scaleY: 0, originY: 0 as number, opacity: 0 },
    open: (i: number) => ({
      scaleY: 1,
      opacity: 1,
      transition: {
        delay: 0.15 * i,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <section
      id="letter"
      ref={sectionRef}
      className="love-letter-section relative py-24 px-6 overflow-hidden"
    >
      {/* Section bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-amber-50 to-purple-50" aria-hidden="true" />

      {/* Decorative dots */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(107,45,107,0.12) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-fraunces text-4xl md:text-5xl text-plum mb-3">
            Surat Untukmu 💌
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px bg-gradient-to-r from-transparent to-rose-300 w-20" />
            <span className="text-rose-400">✉</span>
            <div className="h-px bg-gradient-to-l from-transparent to-rose-300 w-20" />
          </div>
        </motion.div>

        {/* Envelope / Letter toggle button */}
        {!isOpen && (
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Envelope visual */}
            <div
              className="envelope-wrapper cursor-pointer group"
              onClick={() => setIsOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Buka surat cinta"
              onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
            >
              {/* Outer envelope */}
              <div className="relative w-80 h-52 bg-gradient-to-br from-amber-100 via-rose-50 to-amber-200 rounded-lg border-2 border-amber-300 shadow-2xl overflow-hidden group-hover:shadow-rose-200/50 transition-all duration-300 group-hover:scale-[1.02]">
                {/* Envelope flap (triangular top) */}
                <div
                  className="absolute top-0 left-0 right-0 h-24 group-hover:opacity-80 transition-all duration-500"
                  style={{
                    background: 'linear-gradient(to bottom right, #f3c5c5, #e8a4a4)',
                    clipPath: 'polygon(0 0, 50% 70%, 100% 0)',
                  }}
                />
                {/* Envelope V-fold lines */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-24"
                  style={{
                    background: 'linear-gradient(135deg, #fde8cc 0%, #f9d4b8 50%, #fde8cc 100%)',
                    clipPath: 'polygon(0 100%, 50% 30%, 100% 100%)',
                  }}
                />
                {/* Envelope left flap */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to right, rgba(243,197,197,0.4) 0%, transparent 40%)',
                    clipPath: 'polygon(0 0, 40% 50%, 0 100%)',
                  }}
                />
                {/* Envelope right flap */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to left, rgba(243,197,197,0.4) 0%, transparent 40%)',
                    clipPath: 'polygon(100% 0, 60% 50%, 100% 100%)',
                  }}
                />

                {/* Wax seal center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                  <motion.div
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg border-2 border-red-300"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="text-white text-xl font-bold" style={{ fontFamily: 'Georgia, serif', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>❤</span>
                  </motion.div>
                  <motion.p
                    className="font-quicksand text-xs text-rose-600 font-semibold"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Buka suratnya ↓
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Opened Letter */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="letter"
              className="letter-paper relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Paper texture background */}
              <div className="letter-paper-inner relative bg-amber-50 rounded-lg shadow-2xl border border-amber-200 overflow-hidden">

                {/* Paper grain texture overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.04]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                  }}
                  aria-hidden="true"
                />

                {/* Deckle-edge top border */}
                <div
                  className="absolute top-0 left-0 right-0 h-3 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to right, #fdf8f3, #f5deb3, #fdf8f3)',
                    maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'12\'%3E%3Cpath d=\'M0 12 Q5 0 10 8 Q15 16 20 6 Q25 -4 30 8 Q35 18 40 12\' fill=\'%23fdf8f3\'/%3E%3C/svg%3E")',
                    WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'12\'%3E%3Cpath d=\'M0 12 Q5 0 10 8 Q15 16 20 6 Q25 -4 30 8 Q35 18 40 12\' fill=\'%23fdf8f3\'/%3E%3C/svg%3E")',
                    maskRepeat: 'repeat-x',
                    WebkitMaskRepeat: 'repeat-x',
                  }}
                  aria-hidden="true"
                />

                {/* Lined paper background */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #d4a017 31px, #d4a017 32px)',
                    backgroundSize: '100% 32px',
                    backgroundPositionY: '60px',
                  }}
                  aria-hidden="true"
                />

                {/* Letter content */}
                <div className="relative z-10 p-8 md:p-12">
                  {/* Decorative header */}
                  <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="h-px bg-rose-300 w-12" />
                      <span className="text-rose-400 text-lg">✿</span>
                      <div className="h-px bg-rose-300 w-12" />
                    </div>
                    <p className="font-caveat text-rose-400 text-sm tracking-widest uppercase">Surat Cintaku</p>
                  </motion.div>

                  {/* Paragraphs — unfold animation */}
                  <div className="space-y-6">
                    {paragraphs.map((para, i) => (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={foldVariants}
                        initial="folded"
                        animate="open"
                        className="overflow-hidden"
                      >
                        <p className="font-caveat text-xl md:text-2xl text-gray-700 leading-relaxed">
                          {para}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Signoff */}
                  <motion.div
                    className="mt-10 text-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 * paragraphs.length + 0.5, duration: 0.8 }}
                  >
                    <div className="inline-block">
                      <p className="font-caveat text-2xl md:text-3xl text-plum leading-tight">
                        {signoff}
                      </p>
                      {/* Underline doodle */}
                      <svg className="mt-1 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden="true">
                        <motion.path
                          d="M0 4 Q50 0 100 4 Q150 8 200 4"
                          stroke="#e8647a"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ delay: 0.2 * paragraphs.length + 0.8, duration: 1, ease: 'easeOut' }}
                        />
                      </svg>
                    </div>
                  </motion.div>

                  {/* Wax seal bottom decoration */}
                  <motion.div
                    className="flex justify-center mt-8"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 * paragraphs.length + 1, duration: 0.5, type: 'spring' }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg border-2 border-red-300">
                        <span className="text-white text-lg">❤</span>
                      </div>
                      <p className="font-caveat text-rose-400 text-sm">dengan cinta</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Close button */}
              <motion.button
                className="mt-4 mx-auto flex items-center gap-2 text-sm text-rose-400 hover:text-rose-600 transition-colors font-quicksand"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={() => setIsOpen(false)}
              >
                <span>↑ Tutup surat</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
