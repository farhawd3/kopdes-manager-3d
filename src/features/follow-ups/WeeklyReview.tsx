import Link from 'next/link';
import type { Workspace } from '../workspace/useWorkspace';
import { addDays, today, formatDate } from '@/lib/date';
import { recordHref } from '../workspace/workspace-navigation';

export function WeeklyReview({ data }: { data: Workspace }) {
  const end = today(),
    start = addDays(end, -6),
    next = addDays(end, 7);
  const tasks = data['work-items'] || [];
  const completed = tasks.filter(
    (row) =>
      row.data.status === 'selesai' &&
      row.data.completed_at &&
      String(row.data.completed_at) >= start &&
      String(row.data.completed_at) <= end,
  );
  const upcoming = tasks
    .filter(
      (row) =>
        !['selesai', 'dibatalkan'].includes(String(row.data.status)) &&
        String(row.data.due_date) > end &&
        String(row.data.due_date) <= next,
    )
    .sort((a, b) => String(a.data.due_date).localeCompare(String(b.data.due_date)));
  return (
    <section className="weekly-review">
      <div className="section-head">
        <div>
          <small>
            {formatDate(start)} – {formatDate(end)}
          </small>
          <h2>Tinjauan mingguan</h2>
        </div>
        <Link href="/laporan">Susun laporan →</Link>
      </div>
      <div className="weekly-review-grid">
        <section>
          <h3>{completed.length} tugas selesai</h3>
          <p>Pekerjaan yang selesai dalam tujuh hari terakhir, dari catatan yang dimuat.</p>
          {completed.slice(0, 5).map((row) => (
            <Link key={row.id} href={recordHref('work-items', row)}>
              {String(row.data.title)}
            </Link>
          ))}
          {!completed.length && <small>Belum ada tugas selesai pada periode ini.</small>}
        </section>
        <section>
          <h3>{upcoming.length} tugas mendatang</h3>
          <p>Tenggat dalam tujuh hari berikutnya, dari catatan yang dimuat.</p>
          {upcoming.slice(0, 5).map((row) => (
            <Link key={row.id} href={recordHref('work-items', row)}>
              <span>{String(row.data.title)}</span>
              <small>{formatDate(String(row.data.due_date))}</small>
            </Link>
          ))}
          {!upcoming.length && <small>Belum ada tenggat pada periode ini.</small>}
        </section>
      </div>
    </section>
  );
}
