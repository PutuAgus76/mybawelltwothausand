export const dynamic = 'force-dynamic';

import { getLoveLetter } from '@/lib/actions/letter';
import LetterEditor from '@/components/admin/LetterEditor';

export default async function AdminLetterPage() {
  const letter = await getLoveLetter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-fraunces text-3xl text-gray-800">Love Letter Editor</h1>
        <p className="font-quicksand text-sm text-gray-500 mt-1">
          Edit isi paragraf dan penutup surat cinta. Lihat perubahan secara langsung di panel preview.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <LetterEditor initialData={letter} />
      </div>
    </div>
  );
}
