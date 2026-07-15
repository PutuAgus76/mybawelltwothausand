export const dynamic = 'force-dynamic';

import { getQuizQuestions } from '@/lib/actions/quiz';
import QuizManager from '@/components/admin/QuizManager';

export default async function AdminQuizPage() {
  const questions = await getQuizQuestions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-fraunces text-3xl text-gray-800">Quiz Manager</h1>
        <p className="font-quicksand text-sm text-gray-500 mt-1">
          Kelola pertanyaan dan pilihan jawaban kuis. Drag untuk mengubah urutan pertanyaan.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <QuizManager initialQuestions={questions} />
      </div>
    </div>
  );
}
