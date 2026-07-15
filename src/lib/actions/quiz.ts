'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { QuizQuestion, QuizOption } from '@/lib/types';

async function getVerifiedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  const admin = await createAdminClient();
  const { data } = await admin
    .from('quiz_questions')
    .select('*, options:quiz_options(*)')
    .order('order_index', { ascending: true });

  return (data ?? []).map((q) => ({
    ...q,
    options: (q.options ?? []).sort(
      (a: QuizOption, b: QuizOption) => a.order_index - b.order_index
    ),
  }));
}

export async function createQuizQuestion(payload: {
  question: string;
  options: { label: string; is_correct: boolean }[];
}) {
  await getVerifiedUser();
  const admin = await createAdminClient();

  const { data: maxRow } = await admin
    .from('quiz_questions')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxRow?.order_index ?? 0) + 1;

  const { data: question, error: qErr } = await admin
    .from('quiz_questions')
    .insert({ question: payload.question, order_index: nextOrder })
    .select()
    .single();

  if (qErr || !question) return { error: qErr?.message ?? 'Failed to create question' };

  const optionRows = payload.options.map((opt, i) => ({
    question_id: question.id,
    label: opt.label,
    is_correct: opt.is_correct,
    order_index: i + 1,
  }));

  const { error: oErr } = await admin.from('quiz_options').insert(optionRows);
  if (oErr) return { error: oErr.message };

  revalidatePath('/');
  return { data: question };
}

export async function updateQuizQuestion(id: string, question: string) {
  await getVerifiedUser();
  const admin = await createAdminClient();
  const { error } = await admin
    .from('quiz_questions')
    .update({ question })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/');
  return { success: true };
}

export async function deleteQuizQuestion(id: string) {
  await getVerifiedUser();
  const admin = await createAdminClient();
  // quiz_options cascade delete via FK
  const { error } = await admin.from('quiz_questions').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/');
  return { success: true };
}

export async function upsertQuizOptions(
  questionId: string,
  options: { id?: string; label: string; is_correct: boolean; order_index: number }[]
) {
  await getVerifiedUser();
  const admin = await createAdminClient();

  // Delete all existing options for this question, re-insert
  await admin.from('quiz_options').delete().eq('question_id', questionId);

  const rows = options.map((opt) => ({
    question_id: questionId,
    label: opt.label,
    is_correct: opt.is_correct,
    order_index: opt.order_index,
  }));

  const { error } = await admin.from('quiz_options').insert(rows);
  if (error) return { error: error.message };

  revalidatePath('/');
  return { success: true };
}

export async function reorderQuizQuestions(
  items: { id: string; order_index: number }[]
) {
  await getVerifiedUser();
  const admin = await createAdminClient();

  await Promise.all(
    items.map(({ id, order_index }) =>
      admin.from('quiz_questions').update({ order_index }).eq('id', id)
    )
  );

  revalidatePath('/');
  return { success: true };
}
