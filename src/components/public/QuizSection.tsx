'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import type { QuizQuestion } from '@/lib/types';

interface QuizSectionProps {
  questions: QuizQuestion[];
}

export default function QuizSection({ questions }: QuizSectionProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null); // option id yang dipilih
  const [finished, setFinished] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  if (!questions.length) return null;

  const total = questions.length;
  const current = questions[currentIdx];
  const progressPct = finished ? 100 : (currentIdx / total) * 100;

  function handleAnswer(optionId: string, isCorrect: boolean) {
    if (answered) return; // sudah dijawab, tunggu next
    setAnswered(optionId);

    if (isCorrect) {
      setScore((s) => s + 1);
      Swal.fire({
        title: '🎉 Benar!',
        text: 'Kamu memang kenal aku dengan baik!',
        icon: 'success',
        confirmButtonText: 'Lanjut →',
        confirmButtonColor: '#e8647a',
        background: '#fdf8f3',
        color: '#2d1b2e',
        timer: 2500,
        timerProgressBar: true,
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        customClass: { popup: 'rounded-2xl font-quicksand' },
      }).then(() => nextQuestion());
    } else {
      Swal.fire({
        title: '💭 Hmm...',
        text: 'Coba lagi lain kali ya, Sayang!',
        icon: 'error',
        confirmButtonText: 'Lanjut →',
        confirmButtonColor: '#9b59b6',
        background: '#fdf8f3',
        color: '#2d1b2e',
        timer: 2500,
        timerProgressBar: true,
        customClass: { popup: 'rounded-2xl font-quicksand' },
      }).then(() => nextQuestion());
    }
  }

  function nextQuestion() {
    if (currentIdx + 1 >= total) {
      setFinished(true);
      showFinalResult(score + (answered && questions[currentIdx].options?.find(o => o.id === answered)?.is_correct ? 1 : 0));
    } else {
      setCurrentIdx((i) => i + 1);
      setAnswered(null);
    }
  }

  function showFinalResult(finalScore: number) {
    const pct = Math.round((finalScore / total) * 100);
    let emoji = '💕';
    let msg = '';

    if (pct === 100) {
      emoji = '🥰';
      msg = 'Sempurna! Kamu benar-benar mengenalku dengan hati!';
    } else if (pct >= 70) {
      emoji = '💖';
      msg = 'Luar biasa! Kamu hampir hafal semua tentang aku!';
    } else if (pct >= 40) {
      emoji = '😊';
      msg = 'Lumayan! Masih banyak waktu untuk saling kenal lebih dalam.';
    } else {
      emoji = '😄';
      msg = 'Masih banyak hal tentang aku yang harus kamu pelajari!';
    }

    Swal.fire({
      title: `${emoji} Skor Kamu: ${finalScore}/${total}`,
      html: `<p class="font-quicksand">${msg}</p><div class="mt-3 text-3xl font-bold" style="color:#e8647a">${pct}%</div>`,
      background: '#fdf8f3',
      color: '#2d1b2e',
      confirmButtonText: '💌 Lihat Surat Cintaku',
      confirmButtonColor: '#e8647a',
      customClass: { popup: 'rounded-2xl font-quicksand', title: 'font-fraunces' },
    }).then(() => {
      document.getElementById('letter')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function restartQuiz() {
    setCurrentIdx(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
  }

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <section
      id="quiz"
      ref={sectionRef}
      className="relative py-24 px-6 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-rose-50 to-amber-50" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(107,45,107,0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-fraunces text-4xl md:text-5xl text-plum mb-3">
            Kuis Tentang Kita ❓
          </h2>
          <p className="font-quicksand text-rose-dark">
            Seberapa jauh kamu mengenalku?
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px bg-gradient-to-r from-transparent to-purple-300 w-20" />
            <span className="text-purple-400">💜</span>
            <div className="h-px bg-gradient-to-l from-transparent to-purple-300 w-20" />
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-quicksand text-sm text-purple-600 font-medium">
              {finished ? 'Selesai! 🎉' : `Pertanyaan ${currentIdx + 1} dari ${total}`}
            </span>
            <span className="font-quicksand text-sm text-rose-500 font-semibold">
              Skor: {score}/{total}
            </span>
          </div>
          <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-400 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Question */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-lg p-6 md:p-8 mb-6">
                <p className="font-fraunces text-xl md:text-2xl text-plum leading-relaxed">
                  {current.question}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {(current.options ?? []).map((opt, i) => {
                  const isSelected = answered === opt.id;
                  const isCorrectOpt = opt.is_correct;
                  let optStyle = 'bg-white/80 border-purple-100 hover:border-rose-300 hover:bg-rose-50 hover:shadow-md cursor-pointer';

                  if (answered) {
                    if (isCorrectOpt) {
                      optStyle = 'bg-emerald-50 border-emerald-400 shadow-emerald-100/50 shadow-lg cursor-default';
                    } else if (isSelected && !isCorrectOpt) {
                      optStyle = 'bg-red-50 border-red-400 cursor-default';
                    } else {
                      optStyle = 'bg-white/50 border-gray-200 opacity-60 cursor-default';
                    }
                  }

                  return (
                    <motion.button
                      key={opt.id}
                      className={`quiz-option w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-200 ${optStyle}`}
                      onClick={() => handleAnswer(opt.id, opt.is_correct)}
                      disabled={!!answered}
                      whileHover={!answered ? { scale: 1.01 } : {}}
                      whileTap={!answered ? { scale: 0.99 } : {}}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.35 }}
                    >
                      {/* Label badge */}
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                          ${answered && isCorrectOpt ? 'bg-emerald-500 text-white' : ''}
                          ${answered && isSelected && !isCorrectOpt ? 'bg-red-500 text-white' : ''}
                          ${!answered || (!isSelected && !isCorrectOpt) ? 'bg-purple-100 text-purple-700' : ''}
                        `}
                      >
                        {answered && isCorrectOpt ? '✓' : answered && isSelected && !isCorrectOpt ? '✗' : optionLabels[i]}
                      </span>
                      <span className="font-quicksand text-gray-700 font-medium">{opt.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Finished state */
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="text-center"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-lg p-8 md:p-12">
                <div className="text-6xl mb-4">
                  {score === total ? '🥰' : score >= total * 0.7 ? '💖' : '😊'}
                </div>
                <h3 className="font-fraunces text-3xl text-plum mb-2">
                  Skor Akhir: {score}/{total}
                </h3>
                <p className="font-quicksand text-gray-600 mb-6">
                  {Math.round((score / total) * 100)}% — {score === total ? 'Sempurna!' : 'Luar biasa!'}
                </p>
                <button
                  onClick={restartQuiz}
                  className="font-quicksand text-sm text-purple-500 hover:text-purple-700 underline transition-colors"
                >
                  Ulangi kuis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
