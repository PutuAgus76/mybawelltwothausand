export const dynamic = 'force-dynamic';

import { getTimelineItems } from '@/lib/actions/timeline';
import TimelineManager from '@/components/admin/TimelineManager';

export default async function AdminTimelinePage() {
  const items = await getTimelineItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-fraunces text-3xl text-gray-800">Timeline Manager</h1>
        <p className="font-quicksand text-sm text-gray-500 mt-1">
          Kelola momen-momen kenangan. Drag untuk mengubah urutan tampilan di halaman publik.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <TimelineManager initialItems={items} />
      </div>
    </div>
  );
}
