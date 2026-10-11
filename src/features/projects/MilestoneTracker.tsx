'use client';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { Flag, CheckCircle2, Calendar, Plus, Edit3, RotateCcw, Check, Layers } from 'lucide-react';
import type { Workspace } from '../workspace/useWorkspace';
import type { Item } from '../records/schemas';
import { Editor } from '../records/Editor';
import { api } from '@/lib/client';
import { formatDate, today, daysBetween } from '@/lib/date';

export function MilestoneTracker({
  workspace,
  refresh,
  scopeProjectId,
}: {
  workspace: Workspace;
  refresh: () => Promise<void>;
  scopeProjectId?: string;
}) {
  const [filter, setFilter] = useState<'semua' | 'mendatang' | 'tercapai'>('semua');
  const [editItem, setEditItem] = useState<Item | null | undefined>();
  const [busyId, setBusyId] = useState<string | null>(null);

  const allMilestones = (workspace.milestones || []).filter(
    (m) => !scopeProjectId || m.data.workstream_id === scopeProjectId,
  );

  const now = today();

  const milestonesWithStats = allMilestones.map((milestone) => {
    const isAchieved = Boolean(milestone.data.actual_date);
    const dueDate = String(milestone.data.due_date || '');
    const isLate = !isAchieved && dueDate < now;
    const daysDiff = dueDate ? daysBetween(now, dueDate) : 0;

    const project = (workspace.workstreams || []).find(
      (w) => w.id === milestone.data.workstream_id,
    );

    const relatedTasks = (workspace['work-items'] || []).filter(
      (t) => t.data.milestone_id === milestone.id,
    );
    const completedTasks = relatedTasks.filter((t) => t.data.status === 'selesai');

    return {
      milestone,
      isAchieved,
      isLate,
      daysDiff,
      projectTitle: String(project?.data.title || 'Proyek Umum'),
      relatedTasks,
      completedTasks,
    };
  });

  const filtered = milestonesWithStats.filter(({ isAchieved }) => {
    if (filter === 'mendatang') return !isAchieved;
    if (filter === 'tercapai') return isAchieved;
    return true;
  });

  const achievedCount = milestonesWithStats.filter((m) => m.isAchieved).length;
  const upcomingCount = milestonesWithStats.length - achievedCount;

  async function toggleAchieved(item: Item, currentAchieved: boolean) {
    setBusyId(item.id);
    try {
      await api('milestones', {
        id: item.id,
        data: {
          ...item.data,
          actual_date: currentAchieved ? '' : today(),
        },
      });
      await refresh();
    } catch (err) {
      console.error('Gagal memperbarui status milestone:', err);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="milestone-showcase-section">
      <div className="milestone-showcase-head">
        <div className="milestone-head-copy">
          <div className="milestone-title-badge">
            <Flag size={18} className="milestone-flag-icon" />
            <h3>Tonggak Capaian (Milestone)</h3>
          </div>
          <p>
            Target hasil kunci (checkpoint) tanpa durasi untuk memantau keberhasilan tiap tahapan
            proyek.
          </p>
        </div>

        <div className="milestone-head-actions">
          <div className="milestone-filter-pills" role="tablist" aria-label="Filter milestone">
            <Button
              type="button"
              role="tab"
              aria-selected={filter === 'semua'}
              className={`milestone-pill-btn ${filter === 'semua' ? 'active' : ''}`}
              onClick={() => setFilter('semua')}
            >
              Semua <small>{milestonesWithStats.length}</small>
            </Button>
            <Button
              type="button"
              role="tab"
              aria-selected={filter === 'mendatang'}
              className={`milestone-pill-btn ${filter === 'mendatang' ? 'active' : ''}`}
              onClick={() => setFilter('mendatang')}
            >
              Mendatang <small>{upcomingCount}</small>
            </Button>
            <Button
              type="button"
              role="tab"
              aria-selected={filter === 'tercapai'}
              className={`milestone-pill-btn ${filter === 'tercapai' ? 'active' : ''}`}
              onClick={() => setFilter('tercapai')}
            >
              Tercapai <small>{achievedCount}</small>
            </Button>
          </div>

          <Button type="button" className="btn-add-milestone" onClick={() => setEditItem(null)}>
            <Plus size={15} />
            <span>Milestone Baru</span>
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="milestone-empty-state">
          <Flag size={32} className="milestone-empty-icon" />
          <h4>
            {filter === 'semua'
              ? 'Belum ada milestone pada proyek ini'
              : filter === 'tercapai'
                ? 'Belum ada milestone yang tercapai'
                : 'Tidak ada milestone yang ditargetkan'}
          </h4>
          <p>Tentukan titik capaian penting untuk memastikan proyek Anda bergerak sesuai target.</p>
          {filter === 'semua' && (
            <Button
              type="button"
              className="btn-create-first-milestone"
              onClick={() => setEditItem(null)}
            >
              <Plus size={15} /> Buat Milestone Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="milestone-cards-grid">
          {filtered.map(
            ({
              milestone,
              isAchieved,
              isLate,
              daysDiff,
              projectTitle,
              relatedTasks,
              completedTasks,
            }) => (
              <article
                key={milestone.id}
                className={`milestone-card ${isAchieved ? 'is-achieved' : isLate ? 'is-late' : 'is-upcoming'}`}
              >
                <div className="milestone-card-top">
                  <div className="milestone-checkpoint-indicator">
                    <span className="milestone-diamond-node">
                      {isAchieved ? <Check size={14} /> : <Flag size={14} />}
                    </span>
                    <span className="milestone-project-name">{projectTitle}</span>
                  </div>

                  <span
                    className={`milestone-status-chip ${
                      isAchieved ? 'chip-achieved' : isLate ? 'chip-late' : 'chip-upcoming'
                    }`}
                  >
                    {isAchieved
                      ? `Tercapai ${formatDate(String(milestone.data.actual_date))}`
                      : isLate
                        ? `Terlewat (${Math.abs(daysDiff)} hari)`
                        : daysDiff === 0
                          ? 'Hari ini'
                          : `${daysDiff} hari lagi`}
                  </span>
                </div>

                <h4 className="milestone-card-title">{String(milestone.data.title)}</h4>

                {Boolean(milestone.data.notes) && (
                  <p className="milestone-card-notes">{String(milestone.data.notes)}</p>
                )}

                <div className="milestone-meta-row">
                  <div className="milestone-date-info">
                    <Calendar size={13} />
                    <span>Target: {formatDate(String(milestone.data.due_date))}</span>
                  </div>

                  <div
                    className="milestone-tasks-count"
                    title="Tugas yang terhubung ke milestone ini"
                  >
                    <Layers size={13} />
                    <span>
                      {relatedTasks.length > 0
                        ? `${completedTasks.length}/${relatedTasks.length} tugas selesai`
                        : 'Belum ada tugas terhubung'}
                    </span>
                  </div>
                </div>

                <div className="milestone-card-actions">
                  <Button
                    type="button"
                    className={`btn-milestone-toggle ${isAchieved ? 'btn-reopen' : 'btn-complete'}`}
                    disabled={busyId === milestone.id}
                    onClick={() => toggleAchieved(milestone, isAchieved)}
                  >
                    {isAchieved ? (
                      <>
                        <RotateCcw size={13} />
                        <span>Buka Kembali</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Tandai Tercapai</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    className="btn-milestone-edit"
                    onClick={() => setEditItem(milestone)}
                    title="Ubah milestone"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </Button>
                </div>
              </article>
            ),
          )}
        </div>
      )}

      {editItem !== undefined && (
        <Editor
          entity="milestones"
          item={editItem || undefined}
          workspace={workspace}
          onClose={() => setEditItem(undefined)}
          onSaved={refresh}
        />
      )}
    </section>
  );
}
