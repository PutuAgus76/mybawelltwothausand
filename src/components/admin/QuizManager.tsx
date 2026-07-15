'use client';

import { useState, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import type { QuizQuestion } from '@/lib/types';
import {
  createQuizQuestion, updateQuizQuestion, deleteQuizQuestion,
  upsertQuizOptions, reorderQuizQuestions,
} from '@/lib/actions/quiz';

// ── Schemas ────────────────────────────────────────────────
const optionSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Pilihan tidak boleh kosong'),
  is_correct: z.boolean(),
});

const questionSchema = z.object({
  question: z.string().min(1, 'Pertanyaan wajib diisi'),
  options: z
    .array(optionSchema)
    .min(2, 'Minimal 2 pilihan jawaban')
    .refine((opts) => opts.filter((o) => o.is_correct).length === 1, {
      message: 'Tepat 1 jawaban yang harus ditandai benar',
    }),
});
type QuestionForm = z.infer<typeof questionSchema>;

// ── Question Form (inline) ─────────────────────────────────
function QuestionForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: QuizQuestion;
  onCancel: () => void;
  onSaved: (q: QuizQuestion) => void;
}) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);

  const {
    register, control, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: initial?.question ?? '',
      options: initial?.options?.length
        ? initial.options.map((o) => ({ id: o.id, label: o.label, is_correct: o.is_correct }))
        : [
            { label: '', is_correct: true },
            { label: '', is_correct: false },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  const watchedOptions = watch('options');

  function selectCorrect(idx: number) {
    watchedOptions.forEach((_, i) => setValue(`options.${i}.is_correct`, i === idx));
  }

  async function onSubmit(data: QuestionForm) {
    setSaving(true);
    try {
      let savedQ: QuizQuestion;

      if (isEdit && initial) {
        // Update question text + replace options
        await updateQuizQuestion(initial.id, data.question);
        await upsertQuizOptions(
          initial.id,
          data.options.map((o, i) => ({ ...o, order_index: i + 1 }))
        );
        savedQ = {
          ...initial,
          question: data.question,
          options: data.options.map((o, i) => ({
            id: o.id ?? crypto.randomUUID(),
            question_id: initial.id,
            label: o.label,
            is_correct: o.is_correct,
            order_index: i + 1,
          })),
        };
      } else {
        const res = await createQuizQuestion({
          question: data.question,
          options: data.options.map((o) => ({ label: o.label, is_correct: o.is_correct })),
        });
        if (res.error || !res.data) throw new Error(res.error ?? 'Gagal menyimpan');
        savedQ = {
          ...(res.data as QuizQuestion),
          options: data.options.map((o, i) => ({
            id: crypto.randomUUID(),
            question_id: (res.data as QuizQuestion).id,
            label: o.label,
            is_correct: o.is_correct,
            order_index: i + 1,
          })),
        };
      }

      Swal.fire({ title: '✅ Tersimpan!', icon: 'success', timer: 1600, showConfirmButton: false, background: '#fdf8f3', customClass: { popup: 'rounded-2xl font-quicksand' } });
      onSaved(savedQ);
      onCancel();
    } catch (err) {
      Swal.fire({ title: '❌ Gagal', text: String(err), icon: 'error', background: '#fdf8f3', confirmButtonColor: '#e8647a', customClass: { popup: 'rounded-2xl font-quicksand' } });
    } finally {
      setSaving(false);
    }
  }

  const optErrors = errors.options as { message?: string } | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-purple-50 rounded-xl border border-purple-100 p-5 space-y-4">
      {/* Question text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 font-quicksand mb-1">Pertanyaan *</label>
        <textarea {...register('question')} rows={2} className={fldCls(!!errors.question)} placeholder="Tulis pertanyaan di sini..." />
        {errors.question && <p className="text-xs text-red-500 mt-1 font-quicksand">{errors.question.message}</p>}
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 font-quicksand mb-2">
          Pilihan Jawaban * <span className="text-xs font-normal text-gray-400">(klik radio = jawaban benar)</span>
        </label>
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              {/* Correct radio */}
              <button
                type="button"
                onClick={() => selectCorrect(i)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  watchedOptions[i]?.is_correct
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-gray-300 hover:border-emerald-400'
                }`}
                aria-label={`Tandai opsi ${i + 1} sebagai benar`}
                title="Tandai sebagai jawaban benar"
              >
                {watchedOptions[i]?.is_correct && <span className="text-xs">✓</span>}
              </button>

              <input
                {...register(`options.${i}.label`)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border-2 border-gray-200 font-quicksand focus:outline-none focus:border-purple-400"
                placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
              />

              {fields.length > 2 && (
                <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-sm px-2">✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Validation error */}
        {optErrors?.message && <p className="text-xs text-red-500 mt-1 font-quicksand">{optErrors.message}</p>}

        {fields.length < 6 && (
          <button
            type="button"
            onClick={() => append({ label: '', is_correct: false })}
            className="mt-2 text-xs text-purple-500 hover:text-purple-700 font-quicksand font-medium"
          >
            ➕ Tambah pilihan
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-quicksand hover:bg-gray-50">Batal</button>
        <button type="submit" disabled={saving} className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-rose-500 text-white rounded-xl text-sm font-semibold font-quicksand disabled:opacity-50">
          {saving ? '⏳...' : isEdit ? '💾 Simpan' : '➕ Tambah'}
        </button>
      </div>
    </form>
  );
}

function fldCls(err: boolean) {
  return `w-full px-3 py-2 rounded-lg border-2 text-sm font-quicksand focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors ${err ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-purple-200'}`;
}

// ── Sortable Question Card ────────────────────────────────
function SortableQuestion({
  q, onEdit, onDelete,
}: { q: QuizQuestion; onEdit: (q: QuizQuestion) => void; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: q.id });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-stretch">
        <button {...attributes} {...listeners}
          className="px-3 bg-gray-50 hover:bg-gray-100 cursor-grab active:cursor-grabbing text-gray-400 border-r border-gray-100 touch-none"
          aria-label="Drag untuk reorder">⠿</button>

        <div className="flex-1 px-4 py-3 min-w-0">
          <p className="font-quicksand text-sm text-gray-800 font-medium truncate">{q.question}</p>
          <p className="text-xs text-gray-400 font-quicksand mt-0.5">{q.options?.length ?? 0} pilihan</p>
        </div>

        <div className="flex items-center gap-1 px-3 border-l border-gray-100">
          <button onClick={() => setExpanded((x) => !x)} className="text-xs px-2 py-1.5 text-gray-500 hover:text-gray-700 font-quicksand">{expanded ? '▲' : '▼'}</button>
          <button onClick={() => onEdit(q)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-quicksand">Edit</button>
          <button onClick={() => onDelete(q.id)} className="text-xs px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg font-quicksand">Hapus</button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50 pt-2">
          <div className="space-y-1">
            {(q.options ?? []).map((opt, i) => (
              <div key={opt.id} className={`flex items-center gap-2 text-xs font-quicksand rounded-lg px-3 py-1.5 ${opt.is_correct ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${opt.is_correct ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}>
                  {opt.is_correct ? '✓' : String.fromCharCode(65 + i)}
                </span>
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Quiz Manager ─────────────────────────────────────
export default function QuizManager({ initialQuestions }: { initialQuestions: QuizQuestion[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = questions.findIndex((q) => q.id === active.id);
    const newIdx = questions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(questions, oldIdx, newIdx).map((q, i) => ({ ...q, order_index: i + 1 }));
    setQuestions(reordered);
    setReordering(true);
    try {
      await reorderQuizQuestions(reordered.map((q) => ({ id: q.id, order_index: q.order_index })));
    } finally {
      setReordering(false);
    }
  }, [questions]);

  async function handleDelete(id: string) {
    const result = await Swal.fire({
      title: 'Hapus pertanyaan ini?',
      text: 'Semua pilihan jawaban ikut terhapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9b59b6',
      background: '#fdf8f3',
      customClass: { popup: 'rounded-2xl font-quicksand' },
    });
    if (!result.isConfirmed) return;
    await deleteQuizQuestion(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    Swal.fire({ title: '🗑️ Terhapus', timer: 1500, showConfirmButton: false, icon: 'success', background: '#fdf8f3', customClass: { popup: 'rounded-2xl font-quicksand' } });
  }

  function handleSaved(saved: QuizQuestion) {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === saved.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
      return [...prev, saved];
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-quicksand text-sm text-gray-500">
          {questions.length} pertanyaan
          {reordering && <span className="ml-2 text-purple-400">⏳ Menyimpan urutan...</span>}
        </p>
        <button
          onClick={() => setEditingId('new')}
          disabled={editingId !== null}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-rose-500 text-white rounded-xl text-sm font-semibold font-quicksand disabled:opacity-50 hover:from-purple-600 hover:to-rose-600 transition-all"
        >
          ➕ Tambah Pertanyaan
        </button>
      </div>

      {/* New question form */}
      {editingId === 'new' && (
        <QuestionForm
          onCancel={() => setEditingId(null)}
          onSaved={(q) => { handleSaved(q); setEditingId(null); }}
        />
      )}

      {/* Sortable list */}
      {questions.length === 0 && editingId !== 'new' ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">❓</p>
          <p className="font-quicksand">Belum ada pertanyaan. Klik &quot;Tambah Pertanyaan&quot; untuk mulai.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {questions.map((q) =>
                editingId === q.id ? (
                  <QuestionForm
                    key={q.id}
                    initial={q}
                    onCancel={() => setEditingId(null)}
                    onSaved={(saved) => { handleSaved(saved); setEditingId(null); }}
                  />
                ) : (
                  <SortableQuestion
                    key={q.id}
                    q={q}
                    onEdit={(q) => setEditingId(q.id)}
                    onDelete={handleDelete}
                  />
                )
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
