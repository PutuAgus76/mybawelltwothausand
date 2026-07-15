export const dynamic = 'force-dynamic';

import { getSiteContent } from '@/lib/actions/site-content';
import HeroEditor from '@/components/admin/HeroEditor';

export default async function AdminHeroPage() {
  const content = await getSiteContent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-fraunces text-3xl text-gray-800">Hero & Footer</h1>
        <p className="font-quicksand text-sm text-gray-500 mt-1">
          Edit judul, tagline, pesan amplop, dan teks footer halaman publik.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <HeroEditor initialValues={content} />
      </div>
    </div>
  );
}
