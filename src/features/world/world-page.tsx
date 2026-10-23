'use client';
import { MonitoringDashboard } from './MonitoringDashboard';
import { useWorkspace } from '@/features/workspace/use-workspace';

/** Dunia Koperasi 3D: layar penuh, membaca data yang sama dengan halaman web. */
export function WorldPage() {
  const { data, loading, error, refresh, more, loadMore, fetching, operations, logistics } = useWorkspace('world');
  return (
    <MonitoringDashboard
      data={data}
      loading={loading}
      error={error}
      refresh={refresh}
      more={more}
      loadMore={loadMore}
      fetching={fetching}
      operations={operations}
      logistics={logistics}
    />
  );
}
