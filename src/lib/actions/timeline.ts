'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TimelineItem } from '@/lib/types';

async function getVerifiedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function getTimelineItems(): Promise<TimelineItem[]> {
  const admin = await createAdminClient();
  const { data } = await admin
    .from('timeline_items')
    .select('*')
    .order('order_index', { ascending: true });
  return (data ?? []) as TimelineItem[];
}

export async function createTimelineItem(payload: {
  date_label: string;
  title: string;
  description?: string;
  photo_url?: string | null;
  photo_alt?: string;
}) {
  await getVerifiedUser();
  const admin = await createAdminClient();

  // Get max order_index
  const { data: maxRow } = await admin
    .from('timeline_items')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxRow?.order_index ?? 0) + 1;

  const { data, error } = await admin
    .from('timeline_items')
    .insert({ ...payload, order_index: nextOrder })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/');
  return { data };
}

export async function updateTimelineItem(
  id: string,
  payload: Partial<Omit<TimelineItem, 'id' | 'created_at' | 'updated_at'>>
) {
  await getVerifiedUser();
  const admin = await createAdminClient();

  const { error } = await admin
    .from('timeline_items')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/');
  return { success: true };
}

export async function deleteTimelineItem(id: string) {
  await getVerifiedUser();
  const admin = await createAdminClient();

  const { error } = await admin
    .from('timeline_items')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/');
  return { success: true };
}

export async function reorderTimelineItems(
  items: { id: string; order_index: number }[]
) {
  await getVerifiedUser();
  const admin = await createAdminClient();

  // Batch update order_index
  const updates = items.map(({ id, order_index }) =>
    admin
      .from('timeline_items')
      .update({ order_index, updated_at: new Date().toISOString() })
      .eq('id', id)
  );

  await Promise.all(updates);
  revalidatePath('/');
  return { success: true };
}
