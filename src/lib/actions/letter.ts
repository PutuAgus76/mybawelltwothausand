'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function getVerifiedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function getLoveLetter() {
  const admin = await createAdminClient();
  const { data } = await admin
    .from('love_letter')
    .select('*')
    .eq('id', 1)
    .single();
  return data;
}

export async function updateLoveLetter(payload: {
  paragraphs: string[];
  signoff: string;
}) {
  await getVerifiedUser();
  const admin = await createAdminClient();

  const { error } = await admin
    .from('love_letter')
    .upsert({ id: 1, ...payload }, { onConflict: 'id' });

  if (error) return { error: error.message };
  revalidatePath('/');
  return { success: true };
}
