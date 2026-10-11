import { notFound } from 'next/navigation';
import { MonitoringDashboard } from '@/features/dunia-3d/MonitoringDashboard';
import { sampleWorkspace } from './sample';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ contoh?: string }>;
}) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const { contoh } = await searchParams;
  return <MonitoringDashboard data={contoh ? sampleWorkspace() : {}} preview />;
}
