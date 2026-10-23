import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProjectDetail } from '@/features/projects/project-detail';

export const metadata: Metadata = { title: 'Proyek' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d-]{36}$/i.test(id)) notFound();
  return <ProjectDetail id={id} />;
}
