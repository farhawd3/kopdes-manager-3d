import type { Workspace } from '../workspace/useWorkspace';
import { schemas } from '../records/schemas';
import { addDays } from '@/lib/date';
export function reportSnapshot(data: Workspace, start: string, end: string) {
  const tasks = (data['work-items'] || []).map((row) => schemas['work-items'].parse(row.data));
  const cashEntries = (data['cash-entries'] || []).filter(
    (row) => String(row.data.date) >= start && String(row.data.date) <= end,
  );
  const cashIn = cashEntries
    .filter((row) => row.data.direction === 'masuk')
    .reduce((sum, row) => sum + Number(row.data.amount || 0), 0);
  const cashOut = cashEntries
    .filter((row) => row.data.direction === 'keluar')
    .reduce((sum, row) => sum + Number(row.data.amount || 0), 0);

  return {
    organization: data.organization?.[0]?.data.title || 'Koperasi',
    completed: tasks
      .filter(
        (row) => row.status === 'selesai' && row.completed_at >= start && row.completed_at <= end,
      )
      .map((row) => row.title),
    overdue: tasks
      .filter((row) => !['selesai', 'dibatalkan'].includes(row.status) && row.due_date < end)
      .map((row) => row.title),
    next: tasks
      .filter(
        (row) =>
          !['selesai', 'dibatalkan'].includes(row.status) &&
          row.due_date > end &&
          row.due_date <= addDays(end, 7),
      )
      .map((row) => row.title),
    decisions: (data.decisions || [])
      .filter((row) => String(row.data.date) >= start && String(row.data.date) <= end)
      .map((row) => String(row.data.title)),
    risks: (data.risks || [])
      .filter((row) => row.data.status !== 'ditutup')
      .map((row) => String(row.data.title)),
    milestones: (data.milestones || [])
      .filter(
        (row) =>
          row.data.actual_date &&
          String(row.data.actual_date) >= start &&
          String(row.data.actual_date) <= end,
      )
      .map((row) => String(row.data.title)),
    cash: {
      in: cashIn,
      out: cashOut,
      net: cashIn - cashOut,
      count: cashEntries.length,
    },
  };
}
export type ReportSnapshot = ReturnType<typeof reportSnapshot> & {
  notes: string;
  status?: 'draft' | 'final';
};
