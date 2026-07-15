// app/api/admin/cloudinary-sign/route.ts
// Server-side: generate Cloudinary upload signature
// API Secret TIDAK PERNAH keluar dari server ini
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  // 1. Verifikasi user login
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Ambil folder dari query param
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder') ?? 'timeline';

  // 3. Buat signature
  const timestamp = Math.round(Date.now() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha256')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  return NextResponse.json({
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder,
    // Upload URL yang akan dipakai client
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  });
}
