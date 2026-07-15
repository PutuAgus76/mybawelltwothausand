'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import type { TimelineItem } from '@/lib/types';
import {
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
  reorderTimelineItems,
} from '@/lib/actions/timeline';

// ── Schemas ──────────────────────────────────────────────────
const itemSchema = z.object({
  title:       z.string().min(1, 'Judul wajib diisi'),
  date_label:  z.string().min(1, 'Tanggal wajib diisi'),
  description: z.string().optional(),
  photo_alt:   z.string().optional(),
});
type ItemForm = z.infer<typeof itemSchema>;

// ── Cloudinary upload helper ──────────────────────────────────
async function uploadToCloudinary(file: File): Promise<string> {
  // 1. Get signature from our server
  const sigRes = await fetch('/api/admin/cloudinary-sign?folder=timeline');
  if (!sigRes.ok) throw new Error('Gagal mendapatkan upload signature');
  const { signature, timestamp, cloudName, apiKey, folder, uploadUrl } = await sigRes.json();

  // 2. Upload directly to Cloudinary (API secret stays on server)
  const fd = new FormData();
  fd.append('file', file);
  fd.append('signature', signature);
  fd.append('timestamp', timestamp);
  fd.append('api_key', apiKey);
  fd.append('folder', folder);

  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: fd });
  if (!uploadRes.ok) throw new Error('Upload ke Cloudinary gagal');
  const uploadData = await uploadRes.json();
  return uploadData.secure_url as string;
}

// ── Sortable Item Card ────────────────────────────────────────
function SortableCard({
  item,
  onEdit,
  onDelete,
}: {
  item: TimelineItem;
  onEdit: (item: TimelineItem) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-stretch">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="px-3 bg-gray-50 hover:bg-gray-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors border-r border-gray-100 touch-none"
          aria-label="Drag untuk reorder"
        >
          ⠿
        </button>

        {/* Photo thumbnail */}
        <div className="flex-shrink-0 w-20 h-20 bg-rose-50 relative overflow-hidden">
          {item.photo_url ? (
            <Image src={item.photo_url} alt={item.photo_alt ?? item.title} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="flex items-center justify-center h-full text-2xl">📷</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 px-4 py-3 min-w-0">
          <p className="font-quicksand text-xs text-rose-400 font-medium truncate">{item.date_label}</p>
          <p className="font-fraunces text-sm text-gray-800 font-semibold truncate mt-0.5">{item.title}</p>
          {item.description && (
            <p className="font-quicksand text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-1 px-3 border-l border-gray-100">
          <button
            onClick={() => onEdit(item)}
            className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-quicksand"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-xs px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors font-quicksand"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Item Modal (Create / Edit) ────────────────────────────────
function ItemModal({
  item,
  onClose,
  onSaved,
}: {
  item?: TimelineItem | null;
  onClose: () => void;
  onSaved: (saved: TimelineItem) => void;
}) {
  const isEdit = !!item;
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(item?.photo_url ?? '');
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title:       item?.title ?? '',
      date_label:  item?.date_label ?? '',
      description: item?.description ?? '',
      photo_alt:   item?.photo_alt ?? '',
    },
  });

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({ title: 'File terlalu besar', text: 'Maksimal 10MB', icon: 'warning', background: '#fdf8f3', confirmButtonColor: '#e8647a' });
      return;
    }
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setPhotoUrl(url);
    } catch (err) {
      Swal.fire({ title: 'Upload gagal', text: String(err), icon: 'error', background: '#fdf8f3', confirmButtonColor: '#e8647a' });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: ItemForm) {
    setSaving(true);
    try {
      const payload = { ...data, photo_url: photoUrl || null };
      let result;
      if (isEdit && item) {
        result = await updateTimelineItem(item.id, payload);
        if (result?.error) throw new Error(result.error);
        onSaved({ ...item, ...payload });
      } else {
        result = await createTimelineItem(payload);
        if (result?.error) throw new Error(result.error);
        onSaved(result.data as TimelineItem);
      }
      Swal.fire({ title: '✅ Tersimpan!', icon: 'success', timer: 1800, showConfirmButton: false, background: '#fdf8f3', customClass: { popup: 'rounded-2xl font-quicksand' } });
      onClose();
    } catch (err) {
      Swal.fire({ title: '❌ Gagal', text: String(err), icon: 'error', background: '#fdf8f3', confirmButtonColor: '#e8647a', customClass: { popup: 'rounded-2xl font-quicksand' } });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-fraunces text-xl text-gray-800">{isEdit ? 'Edit Momen' : 'Tambah Momen Baru'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Photo upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 font-quicksand">Foto</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-rose-50 flex items-center justify-center border-2 border-dashed border-rose-200 flex-shrink-0">
                {photoUrl ? (
                  <Image src={photoUrl} alt="Preview" width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-sm font-medium font-quicksand transition-colors">
                  {uploading ? '⏳ Mengupload...' : '📤 Pilih Foto'}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={uploading} />
                </label>
                <p className="text-xs text-gray-400 mt-1 font-quicksand">Max 10MB. JPG/PNG/WebP.</p>
                {photoUrl && (
                  <button type="button" onClick={() => setPhotoUrl('')} className="text-xs text-red-400 hover:text-red-600 mt-1 font-quicksand">
                    Hapus foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <ModalField label="Judul Momen *" error={errors.title?.message}>
            <input {...register('title')} className={mInputCls(!!errors.title)} placeholder="Hari Pertama Kita" />
          </ModalField>

          {/* Date label */}
          <ModalField label="Label Tanggal *" error={errors.date_label?.message} hint='Contoh: "15 September 2023"'>
            <input {...register('date_label')} className={mInputCls(!!errors.date_label)} placeholder="15 September 2023" />
          </ModalField>

          {/* Description */}
          <ModalField label="Cerita" error={errors.description?.message}>
            <textarea {...register('description')} rows={4} className={mInputCls(!!errors.description)} placeholder="Ceritakan momen ini..." />
          </ModalField>

          {/* Photo alt */}
          <ModalField label="Deskripsi Foto (alt text)" error={errors.photo_alt?.message} hint="Untuk aksesibilitas screen reader">
            <input {...register('photo_alt')} className={mInputCls(!!errors.photo_alt)} placeholder="Foto kita di pantai" />
          </ModalField>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-quicksand text-sm hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving || uploading} className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl font-quicksand text-sm font-semibold disabled:opacity-50 transition-all hover:from-rose-600 hover:to-purple-700">
              {saving ? '⏳ Menyimpan...' : isEdit ? '💾 Simpan' : '➕ Tambahkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function mInputCls(err: boolean) {
  return `w-full px-3 py-2 rounded-lg border-2 text-sm font-quicksand focus:outline-none focus:ring-2 focus:ring-rose-300 transition-colors ${err ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-rose-200'}`;
}
function ModalField({ label, children, error, hint }: { label: string; children: React.ReactNode; error?: string; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-gray-700 font-quicksand">{label}</label>
      {hint && <p className="text-xs text-gray-400 font-quicksand">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500 font-quicksand">{error}</p>}
    </div>
  );
}

// ── Main Timeline Manager ─────────────────────────────────────
export default function TimelineManager({ initialItems }: { initialItems: TimelineItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [modalItem, setModalItem] = useState<TimelineItem | null | undefined>(undefined); // undefined = closed
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx).map((item, i) => ({
      ...item,
      order_index: i + 1,
    }));

    setItems(reordered);
    setReordering(true);

    try {
      await reorderTimelineItems(reordered.map((i) => ({ id: i.id, order_index: i.order_index })));
    } catch {
      Swal.fire({ title: 'Gagal menyimpan urutan', icon: 'error', background: '#fdf8f3', confirmButtonColor: '#e8647a' });
    } finally {
      setReordering(false);
    }
  }, [items]);

  async function handleDelete(id: string) {
    const result = await Swal.fire({
      title: 'Hapus momen ini?',
      text: 'Tindakan ini tidak bisa dibatalkan.',
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

    const res = await deleteTimelineItem(id);
    if (res?.error) {
      Swal.fire({ title: 'Gagal hapus', text: res.error, icon: 'error', background: '#fdf8f3', confirmButtonColor: '#e8647a' });
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    Swal.fire({ title: '🗑️ Terhapus', timer: 1500, showConfirmButton: false, icon: 'success', background: '#fdf8f3', customClass: { popup: 'rounded-2xl font-quicksand' } });
  }

  function handleSaved(saved: TimelineItem) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-quicksand text-sm text-gray-500">
          {items.length} momen · Drag untuk reorder
          {reordering && <span className="ml-2 text-purple-400">⏳ Menyimpan urutan...</span>}
        </p>
        <button
          onClick={() => setModalItem(null)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl text-sm font-semibold font-quicksand hover:from-rose-600 hover:to-purple-700 transition-all"
        >
          ➕ Tambah Momen
        </button>
      </div>

      {/* Sortable list */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📸</p>
          <p className="font-quicksand">Belum ada momen. Klik &quot;Tambah Momen&quot; untuk mulai.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableCard
                  key={item.id}
                  item={item}
                  onEdit={setModalItem}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Modal */}
      {modalItem !== undefined && (
        <ItemModal
          item={modalItem}
          onClose={() => setModalItem(undefined)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
