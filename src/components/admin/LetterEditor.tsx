'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import type { LoveLetter } from '@/lib/types';
import { updateLoveLetter } from '@/lib/actions/letter';

const schema = z.object({
  paragraphs: z
    .array(z.object({ value: z.string().min(1, 'Paragraf tidak boleh kosong') }))
    .min(1, 'Minimal 1 paragraf'),
  signoff: z.string().min(1, 'Tanda tangan wajib diisi'),
});

type FormValues = z.infer<typeof schema>;

interface LetterEditorProps {
  initialData?: LoveLetter | null;
}

export default function LetterEditor({ initialData }: LetterEditorProps) {
  const [saving, setSaving] = useState(false);

  const defaultParagraphs = initialData?.paragraphs?.length
    ? initialData.paragraphs.map((p) => ({ value: p }))
    : [
        { value: 'Sayang, kalau kamu baca ini, aku ingin kamu tahu betapa berartinya kamu dalam hidupku.' },
        { value: 'Setiap hari bersamamu adalah hadiah yang tidak pernah aku bayangkan akan aku dapatkan.' },
      ];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paragraphs: defaultParagraphs,
      signoff: initialData?.signoff ?? 'Dengan seluruh cintaku, ❤',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'paragraphs',
  });

  const watchedParagraphs = watch('paragraphs');
  const watchedSignoff = watch('signoff');

  async function onSubmit(data: FormValues) {
    setSaving(true);
    try {
      const payload = {
        paragraphs: data.paragraphs.map((p) => p.value),
        signoff: data.signoff,
      };

      const result = await updateLoveLetter(payload);
      if (result?.error) throw new Error(result.error);

      Swal.fire({
        title: '✅ Tersimpan!',
        text: 'Surat cinta berhasil diperbarui.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
        background: '#fdf8f3',
        color: '#2d1b2e',
        customClass: { popup: 'rounded-2xl font-quicksand' },
      });
    } catch (err) {
      Swal.fire({
        title: '❌ Gagal',
        text: err instanceof Error ? err.message : 'Terjadi kesalahan',
        icon: 'error',
        background: '#fdf8f3',
        confirmButtonColor: '#e8647a',
        customClass: { popup: 'rounded-2xl font-quicksand' },
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Editor Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700 font-quicksand">
              Paragraf Surat *
            </label>
            <span className="text-xs text-gray-400 font-quicksand">
              {fields.length} Paragraf
            </span>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="relative group">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-quicksand text-xs font-semibold flex items-center justify-center mt-2">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <textarea
                      {...register(`paragraphs.${index}.value`)}
                      rows={3}
                      className={`w-full px-4 py-2.5 rounded-xl border-2 font-quicksand text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300 ${
                        errors.paragraphs?.[index]?.value
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-200 bg-white hover:border-rose-200 focus:border-rose-400'
                      }`}
                      placeholder={`Tulis paragraf ${index + 1}...`}
                    />
                    {errors.paragraphs?.[index]?.value && (
                      <p className="text-xs text-red-500 mt-1 font-quicksand">
                        {errors.paragraphs[index]?.value?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors mt-2"
                      title="Hapus Paragraf"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {errors.paragraphs?.message && (
            <p className="text-xs text-red-500 mt-2 font-quicksand">
              {errors.paragraphs.message}
            </p>
          )}

          <button
            type="button"
            onClick={() => append({ value: '' })}
            className="mt-3 text-sm font-semibold text-rose-500 hover:text-rose-600 font-quicksand flex items-center gap-1.5 transition-colors"
          >
            <span>➕</span> Tambah Paragraf Baru
          </button>
        </div>

        {/* Signoff field */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 font-quicksand">
            Tanda Tangan / Penutup (Sign-off) *
          </label>
          <input
            {...register('signoff')}
            className={`w-full px-4 py-2.5 rounded-xl border-2 font-quicksand text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300 ${
              errors.signoff
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 bg-white hover:border-rose-200 focus:border-rose-400'
            }`}
            placeholder="Dengan seluruh cintaku, Nama"
          />
          {errors.signoff && (
            <p className="text-xs text-red-500 mt-1 font-quicksand">
              {errors.signoff.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-quicksand"
          >
            {saving ? '⏳ Menyimpan...' : '💾 Simpan Surat'}
          </button>
          {!isDirty && (
            <p className="text-sm text-gray-400 font-quicksand">
              Belum ada perubahan
            </p>
          )}
        </div>
      </form>

      {/* Live Preview Pane */}
      <div className="space-y-3 lg:sticky lg:top-8">
        <div className="flex items-center justify-between">
          <h3 className="font-fraunces text-lg text-gray-800">Preview Live 👁️</h3>
          <span className="text-xs text-rose-400 font-quicksand font-medium">
            Tampilan di Website
          </span>
        </div>

        <div className="letter-paper relative bg-amber-50 rounded-xl shadow-lg border border-amber-200 p-6 md:p-8 overflow-hidden min-h-[300px]">
          {/* Paper lines overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(transparent, transparent 31px, #d4a017 31px, #d4a017 32px)',
              backgroundSize: '100% 32px',
              backgroundPositionY: '40px',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-4">
            <div className="text-center mb-6">
              <span className="text-rose-400 text-sm">✿</span>
              <p className="font-caveat text-rose-400 text-xs tracking-widest uppercase">
                Surat Cintaku
              </p>
            </div>

            {watchedParagraphs.map((p, idx) => (
              <p key={idx} className="font-caveat text-xl text-gray-700 leading-relaxed">
                {p.value || (
                  <span className="text-gray-300 italic">
                    (Paragraf {idx + 1} kosong...)
                  </span>
                )}
              </p>
            ))}

            <div className="pt-6 text-right">
              <p className="font-caveat text-2xl text-plum">
                {watchedSignoff || <span className="text-gray-300 italic">(Tanda tangan)</span>}
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs shadow-md border border-red-300">
                ❤
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
