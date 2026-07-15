// app/api/auth/signout/route.ts
// POST endpoint untuk logout admin
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
