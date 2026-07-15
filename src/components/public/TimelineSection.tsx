'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { TimelineItem } from '@/lib/types';

interface TimelineSectionProps {
  items: TimelineItem[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// Rotasi acak tapi konsisten per card (berdasarkan index)
const rotations = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 2.5];

export default function TimelineSection({ items }: TimelineSectionProps) {
  if (!items.length) return null;

  return (
    <section id="timeline" className="timeline-section py-20 px-6 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream/50 to-rose-petal/20" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-fraunces text-4xl md:text-5xl text-plum mb-3">
            Perjalanan Kita 🌸
          </h2>
          <p className="font-quicksand text-rose-dark text-lg">
            Setiap momen yang kita ukir bersama
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px bg-gradient-to-r from-transparent to-rose-300 w-20" />
            <span className="text-rose-400">💕</span>
            <div className="h-px bg-gradient-to-l from-transparent to-rose-300 w-20" />
          </div>
        </motion.div>

        {/* Timeline items grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.article
              key={item.id}
              className="timeline-card group relative"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              style={{
                rotate: rotations[index % rotations.length],
              }}
              whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Polaroid card */}
              <div className="bg-white rounded-sm shadow-lg p-4 pb-10 transition-shadow duration-300 group-hover:shadow-2xl">
                {/* Photo area */}
                <div className="photo-frame relative w-full aspect-square bg-gradient-to-br from-rose-50 to-amber-50 rounded-sm overflow-hidden mb-4">
                  {item.photo_url ? (
                    <Image
                      src={item.photo_url}
                      alt={item.photo_alt ?? item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-rose-300">
                      <span className="text-5xl mb-2">📷</span>
                      <p className="font-quicksand text-xs text-center px-2 text-rose-300">
                        Foto akan ditambah lewat admin panel
                      </p>
                    </div>
                  )}

                  {/* Tape decorations */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-5 bg-amber-200/70 rounded-sm rotate-1"
                    aria-hidden="true"
                  />
                </div>

                {/* Card content */}
                <div className="px-1">
                  <time className="font-quicksand text-xs text-rose-400 font-medium tracking-wide uppercase block mb-1">
                    {item.date_label}
                  </time>
                  <h3 className="font-fraunces text-lg text-plum mb-2 leading-tight">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="font-quicksand text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Order badge */}
                <div className="absolute bottom-3 right-4 font-caveat text-rose-300 text-lg">
                  #{item.order_index}
                </div>
              </div>

              {/* Shadow under polaroid */}
              <div
                className="absolute -bottom-2 left-2 right-2 h-4 bg-gray-900/10 blur-md rounded-full -z-10"
                aria-hidden="true"
              />
            </motion.article>
          ))}
        </div>

        {/* Footer decoration */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-caveat text-2xl text-rose-400">
            Dan masih banyak lagi yang akan kita tulis... 🌹
          </p>
        </motion.div>
      </div>
    </section>
  );
}
