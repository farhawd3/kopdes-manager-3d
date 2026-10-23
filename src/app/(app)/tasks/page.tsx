import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TasksPage } from '@/features/tasks/tasks-page';
import { PageLoading } from '@/features/records/records-page';

export const metadata: Metadata = { title: 'Tugas' };

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TasksPage />
    </Suspense>
  );
}
