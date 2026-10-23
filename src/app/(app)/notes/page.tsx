import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RecordsPage, PageLoading } from '@/features/records/records-page';
import { Reports } from '@/features/notes/reports';

export const metadata: Metadata = { title: 'Catatan' };

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RecordsPage page="notes" extraTabs={{ reports: <Reports /> }} />
    </Suspense>
  );
}
