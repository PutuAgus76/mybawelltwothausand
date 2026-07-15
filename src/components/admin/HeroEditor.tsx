'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { updateSiteContent } from '@/lib/actions/site-content';

const schema = z.object({
  hero_title:       z.string().min(1, 'Wajib diisi').max(100),
  hero_subtitle:    z.string().min(1, 'Wajib diisi').max(200),
  hero_counter_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD').optional().or(z.literal('')),
  envelope_message: z.string().min(1, 'Wajib diisi').max(300),
  signoff_name:     z.string().min(1, 'Wajib diisi').max(100),
  footer_text:      z.string().min(1, 'Wajib diisi').max(200),
});

type FormValues = z.infer<typeof schema>;

interface HeroEditorProps {
  initialValues: Record<string, string>;
}

export default function HeroEditor({ initialValues }: HeroEditorProps) {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hero_title:          initialValues['hero_title'] ?? '',
      hero_subtitle:       initialValues['hero_subtitle'] ?? '',
      hero_counter_start:  initialValues['hero_counter_start'] ?? '',
      envelope_message:    initialValues['envelope_message'] ?? '',
      signoff_name:        initialValues['signoff_name'] ?? '',
      footer_text:         initialValues['footer_text'] ?? '',
    },
  });

  async function onSubmit(data: FormValues) {
    setSaving(true);
    try {
      const result = await updateSiteContent(data);
      if (result?.error) throw new Error(result.error);

      Swal.fire({
        title: '✅ Tersimpan!',
        text: 'Perubahan hero & footer berhasil disimpan.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hero Title */}
        <Field label="Judul Hero" error={errors.hero_title?.message} hint="Nama kalian / judul utama">
          <input {...register('hero_title')} className={inputCls(!!errors.hero_title)} placeholder="Our Love Story 💕" />
        </Field>

        {/* Hero Subtitle */}
        <Field label="Subtitle Hero" error={errors.hero_subtitle?.message} hint="Tagline singkat di bawah judul">
          <input {...register('hero_subtitle')} className={inputCls(!!errors.hero_subtitle)} placeholder="2 Tahun 10 Bulan Bersama" />
        </Field>

        {/* Counter Start Date */}
        <Field label="Tanggal Mulai Pacaran" error={errors.hero_counter_start?.message} hint="Format: YYYY-MM-DD (opsional, untuk counter waktu)">
          <input {...register('hero_counter_start')} type="date" className={inputCls(!!errors.hero_counter_start)} />
        </Field>

        {/* Signoff Name */}
        <Field label="Nama Pengirim" error={errors.signoff_name?.message} hint="Nama kamu untuk tanda tangan">
          <input {...register('signoff_name')} className={inputCls(!!errors.signoff_name)} placeholder="Nama Kamu" />
        </Field>
      </div>

      {/* Envelope Message */}
      <Field label="Pesan di Dalam Amplop" error={errors.envelope_message?.message} hint="Muncul saat amplop dibuka di halaman utama">
        <textarea {...register('envelope_message')} rows={3} className={inputCls(!!errors.envelope_message)} placeholder="Hei Sayang, ini untuk kamu..." />
      </Field>

      {/* Footer Text */}
      <Field label="Teks Footer" error={errors.footer_text?.message} hint="Pesan di bagian bawah halaman">
        <input {...register('footer_text')} className={inputCls(!!errors.footer_text)} placeholder="Dibuat dengan ❤️ oleh ... untuk ..." />
      </Field>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-quicksand"
        >
          {saving ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
        </button>
        {!isDirty && <p className="text-sm text-gray-400 font-quicksand">Belum ada perubahan</p>}
      </div>
    </form>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-4 py-2.5 rounded-xl border-2 font-quicksand text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300 ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-rose-200 focus:border-rose-400'
  }`;
}

function Field({ label, children, error, hint }: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-gray-700 font-quicksand">{label}</label>
      {hint && <p className="text-xs text-gray-400 font-quicksand">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500 font-quicksand">{error}</p>}
    </div>
  );
}
