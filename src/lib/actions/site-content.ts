'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function getVerifiedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function updateSiteContent(entries: Record<string, string>) {
  await getVerifiedUser();
  const admin = await createAdminClient();

  const rows = Object.entries(entries).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await admin
    .from('site_content')
    .upsert(rows, { onConflict: 'key' });

  if (error) return { error: error.message };

  revalidatePath('/');
  return { success: true };
}

export async function getSiteContent(): Promise<Record<string, string>> {
  const admin = await createAdminClient();
  const { data } = await admin.from('site_content').select('key, value');
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? '']));
}
