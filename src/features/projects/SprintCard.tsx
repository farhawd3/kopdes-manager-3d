'use client';
import { Button } from '@/components/ui/Button';
import { Calendar, Edit2, Trash2 } from 'lucide-react';
import { schemas, type Item } from '../records/schemas';
import { planProgress } from '@/lib/progress';
import { formatDate } from '@/lib/date';
import { api } from '@/lib/client';

export function SprintCard({
  sprint,
  tasks,
  onEdit,
  onRefresh,
}: {
  sprint: Item;
  tasks: Item[];
  onEdit: (sprint: Item) => void;
  onRefresh: () => Promise<void>;
}) {
  const data = sprint.data;
  const sprintTasks = tasks.filter(
    (t) => t.data.sprint_id === sprint.id && t.data.status !== 'dibatalkan',
  );
  const doneTasks = sprintTasks.filter((t) => t.data.status === 'selesai');
  const percent = planProgress(
    sprintTasks.map((task) => ({
      status: schemas['work-items'].shape.status.parse(task.data.status),
    })),
  );

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Hapus sprint "${data.title}"?`)) return;
    try {
      await api('sprints', { id: sprint.id }, 'DELETE');
      await onRefresh();
    } catch (err) {
      alert((err as Error).message || 'Gagal menghapus sprint.');
    }
  }

  return (
    <article
      className="sprint-summary-card"
      role="button"
      tabIndex={0}
      onClick={() => onEdit(sprint)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(sprint);
        }
      }}
    >
      <header className="sprint-card-head">
        <div className="sprint-card-title-group">
          <span className="sprint-chip">Periode</span>
          <h3>{String(data.title)}</h3>
        </div>
        <div className="sprint-card-actions">
          <span className={`sprint-status-tag status-${data.status || 'aktif'}`}>
            {String(data.status || 'aktif')}
          </span>
          <Button
            type="button"
            className="sprint-action-btn"
            title="Ubah Target Periode"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(sprint);
            }}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            type="button"
            className="sprint-action-btn delete-btn"
            title="Hapus"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </header>

      {Boolean(data.goal) && <p className="sprint-goal-text">{String(data.goal)}</p>}

      <div className="sprint-timeline-row">
        <Calendar size={14} />
        <span>
          {data.start_date ? formatDate(String(data.start_date)) : 'Mulai segera'} –{' '}
          {data.end_date ? formatDate(String(data.end_date)) : 'Target fleksibel'}
        </span>
        <small className="duration-pill">{String(data.duration || '2 minggu')}</small>
      </div>

      <div className="sprint-progress-wrap">
        <div className="progress-labels">
          <span>Progres target</span>
          <strong>{percent}%</strong>
        </div>
        <div className="sprint-progress-bar">
          <div className="sprint-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="sprint-task-stats">
          <span>
            {doneTasks.length} dari {sprintTasks.length} tugas selesai
          </span>
        </div>
      </div>
    </article>
  );
}
