import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProjectsPage } from '@/features/projects/projects-page';
import { PageLoading } from '@/features/records/records-page';

export const metadata: Metadata = { title: 'Proyek' };

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProjectsPage />
    </Suspense>
  );
}
