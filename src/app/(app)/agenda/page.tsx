import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RecordsPage, PageLoading } from '@/features/records/records-page';
import { PAGES } from '@/components/layout/nav';

export const metadata: Metadata = { title: PAGES['agenda'].label };

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RecordsPage page="agenda" />
    </Suspense>
  );
}
