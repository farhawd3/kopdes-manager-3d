import { Suspense } from 'react';
import type { Metadata } from 'next';
import { WorldPage } from '@/features/world/world-page';

export const metadata: Metadata = { title: 'Dunia 3D' };

export default function Page() {
  return (
    <Suspense>
      <WorldPage />
    </Suspense>
  );
}
