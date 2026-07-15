'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SiteContentMap } from '@/lib/types';

interface HeroSectionProps {
  content: SiteContentMap;
}

export default function HeroSection({ content }: HeroSectionProps) {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const heroTitle = content['hero_title'] ?? 'Our Love Story 💕';
  const heroSubtitle = content['hero_subtitle'] ?? 'Waktu yang indah bersama';
  const envelopeMessage = content['envelope_message'] ?? 'Hei Sayang, ini untukmu...';

  function handleEnvelopeClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!envelopeOpen) {
      setEnvelopeOpen(true);
      // Burst hearts effect
      const newHearts = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: e.clientX + (Math.random() - 0.5) * 200,
        y: e.clientY + (Math.random() - 0.5) * 200,
      }));
      setHearts(newHearts);
      setTimeout(() => setHearts([]), 1500);
    }
  }

  return (
    <section className="hero-section relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-rose-petal to-lavender opacity-60" />
      <div className="dots-decoration absolute inset-0" aria-hidden="true" />

      {/* Floating petals decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {['🌸', '🌺', '✨', '💫', '🌷', '🌹'].map((petal, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl opacity-20"
            style={{ left: `${10 + i * 15}%`, top: `${10 + (i % 3) * 25}%` }}
            animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {petal}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Title */}
        <motion.h1
          className="hero-title font-fraunces text-5xl md:text-7xl text-plum mb-4 leading-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {heroTitle}
        </motion.h1>

        <motion.p
          className="hero-subtitle font-quicksand text-lg md:text-xl text-rose-dark mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          {heroSubtitle}
        </motion.p>

        {/* Envelope */}
        <motion.div
          className="envelope-container cursor-pointer select-none mx-auto"
          style={{ width: 220, height: 160 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          whileHover={{ scale: envelopeOpen ? 1 : 1.05 }}
          onClick={handleEnvelopeClick}
          role="button"
          aria-label="Buka amplop kejutan"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleEnvelopeClick(e as unknown as React.MouseEvent<HTMLDivElement>)}
        >
          {/* Envelope body */}
          <div className="envelope-body relative w-full h-full bg-gradient-to-br from-amber-100 to-rose-100 rounded-b-lg border-2 border-amber-300 shadow-xl overflow-hidden">
            {/* Envelope flap */}
            <motion.div
              className="envelope-flap absolute top-0 left-0 right-0 origin-top"
              style={{ height: '50%' }}
              animate={envelopeOpen ? { rotateX: -180, opacity: 0 } : { rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, #f9d4d4 0%, #e8b4b8 50%, #f9d4d4 100%)',
                  clipPath: 'polygon(0 0, 50% 80%, 100% 0)',
                }}
              />
            </motion.div>

            {/* Envelope sides */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!envelopeOpen ? (
                <motion.div className="text-center" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}>
                  <div className="text-4xl mb-2">💌</div>
                  <p className="font-quicksand text-xs text-rose-600 font-medium">Klik untuk membuka</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    className="text-center px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <p className="font-caveat text-rose-700 text-lg leading-relaxed">{envelopeMessage}</p>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Wax seal */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-xs shadow-md">
              ❤
            </div>
          </div>
        </motion.div>

        {/* Open indication */}
        {!envelopeOpen && (
          <motion.p
            className="mt-6 font-quicksand text-sm text-rose-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ↑ Klik amplop untuk kejutan
          </motion.p>
        )}

        {/* Scroll hint */}
        {envelopeOpen && (
          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="w-6 h-10 border-2 border-rose-400 rounded-full mx-auto flex items-start justify-center pt-2"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                className="w-1.5 h-3 bg-rose-400 rounded-full"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
            <p className="font-quicksand text-sm text-rose-400 mt-2">Scroll untuk melihat perjalanan kita</p>
          </motion.div>
        )}
      </div>

      {/* Burst hearts */}
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.span
            key={heart.id}
            className="fixed pointer-events-none text-2xl z-50"
            style={{ left: heart.x, top: heart.y }}
            initial={{ opacity: 1, scale: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, y: -80 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            {['❤️', '💕', '💖', '🌸', '✨'][Math.floor(Math.random() * 5)]}
          </motion.span>
        ))}
      </AnimatePresence>
    </section>
  );
}
