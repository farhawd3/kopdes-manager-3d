'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import { usePreference } from '@/lib/usePreference';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowUpRight,
  CalendarDays,
  ArrowRight,
  Clock,
  Video,
  SlidersHorizontal,
  Plus,
  Trash2,
  RotateCcw,
  X,
} from 'lucide-react';
import { FollowUps } from '../follow-ups/FollowUps';
import { getFollowUps, recordHref } from '../workspace/workspace-navigation';
import type { Workspace } from '../workspace/useWorkspace';
import { schemas } from '../records/schemas';
import { planProgress, isOverdue, scopeProgress } from '@/lib/progress';
import { today, addDays, formatDate } from '@/lib/date';
import { cashSummary, rupiah } from '../operations/ledger';
import { meetingJoinUrl } from '../meetings/meeting';
import {
  WeekBarChart,
  TaskDonutChart,
  StatCard,
  ProjectProgressBar,
} from '@/components/charts/DashboardCharts';
import { Select } from '@/components/ui/Select';
import { Ikon3D } from '@/components/ui/Ikon3D';

const routineSchema = z.array(z.object({ id: z.string(), time: z.string(), title: z.string() }));
function parseRoutinePreference<T>(text: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const parsed = schema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export function Dashboard({ data, preferenceScope = '' }: { data: Workspace; preferenceScope?: string }) {
  const now = today();
  const [projectId, setProjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [routineOpen, setRoutineOpen] = usePreference(preferenceScope + 'hub-dashboard-routine-open', 'false');
  const [chartsOpen, setChartsOpen] = usePreference(preferenceScope + 'hub-dashboard-charts-open', 'false');
  const allTasks = (data['work-items'] || []).map((row) => ({
    ...schemas['work-items'].parse(row.data),
    id: row.id,
  }));
  const tasks = allTasks.filter((task) => !projectId || task.workstream_id === projectId);
  const [filter, setFilter] = useState('aktif');
  const open = tasks.filter((t) => !['selesai', 'dibatalkan'].includes(t.status));
  const visible = tasks
    .filter((t) =>
      ['selesai', 'rencana', 'proses', 'dibatalkan'].includes(filter)
        ? t.status === filter
        : filter === 'terlambat'
          ? isOverdue(t, now)
          : !['selesai', 'dibatalkan'].includes(t.status),
    )
    .filter((t) => !selectedDate || (t.status === 'selesai' && t.completed_at === selectedDate))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const projects = data.workstreams || [];
  const visibleProjects = projects.filter(
    (project) => project.data.status !== 'diarsipkan' && (!projectId || project.id === projectId),
  );
  const meeting = (data.meetings || [])
    .filter(
      (m) =>
        String(m.data.date) >= now && m.data.status !== 'selesai' && m.data.status !== 'dibatalkan',
    )
    .sort((a, b) =>
      `${a.data.date}${a.data.time}`.localeCompare(`${b.data.date}${b.data.time}`),
    )[0];

  const meetingOnlineUrl = meetingJoinUrl(meeting);

  // Rutinitas harian manajer gerai KDMP Puntukrejo
  const ROUTINE_CONFIG_KEY = 'kdmp_manager_routine_config';
  const ROUTINE_KEY = `kdmp_manager_routine_${now}`;
  const DEFAULT_ROUTINES = [
    { id: 'kas-awal', time: '07:30', title: 'Buka gerai & cek kas modal awal' },
    { id: 'briefing', time: '08:30', title: 'Briefing singkat petugas kasir/toko' },
    { id: 'cek-rak', time: '10:00', title: 'Cek persediaan barang rak & stok menipis' },
    { id: 'rekap-siang', time: '13:00', title: 'Rekapitulasi setoran anggota & kas tengah hari' },
    { id: 'tutup-buku', time: '16:30', title: 'Tutup buku kas harian & hitung fisik uang kasir' },
    { id: 'kunci-toko', time: '17:00', title: 'Cek keamanan, inventaris, dan kunci gerai' },
  ];

  const [routineText, setRoutineText] = usePreference(
    preferenceScope + ROUTINE_CONFIG_KEY,
    JSON.stringify(DEFAULT_ROUTINES),
  );
  const [completedText, setCompletedText] = usePreference(preferenceScope + ROUTINE_KEY, '[]');
  const routines = parseRoutinePreference(routineText, routineSchema, DEFAULT_ROUTINES);
  const completedRoutines = parseRoutinePreference(completedText, z.array(z.string()), []);
  const routineCompletedCount = routines.filter((routine) =>
    completedRoutines.includes(routine.id),
  ).length;
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [newRoutineTime, setNewRoutineTime] = useState('08:00');
  const [newRoutineTitle, setNewRoutineTitle] = useState('');

  function saveRoutines(items: typeof DEFAULT_ROUTINES) {
    setRoutineText(JSON.stringify(items));
  }

  function handleAddRoutine(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoutineTitle.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      time: newRoutineTime.trim() || '08:00',
      title: newRoutineTitle.trim(),
    };
    const updated = [...routines, newItem].sort((a, b) => a.time.localeCompare(b.time));
    saveRoutines(updated);
    setNewRoutineTitle('');
  }

  function handleDeleteRoutine(id: string) {
    const updated = routines.filter((r) => r.id !== id);
    saveRoutines(updated);
  }

  function handleResetRoutines() {
    saveRoutines(DEFAULT_ROUTINES);
  }

  function toggleRoutine(id: string) {
    const next = completedRoutines.includes(id)
      ? completedRoutines.filter((item) => item !== id)
      : [...completedRoutines, id];
    setCompletedText(JSON.stringify(next));
  }

  // Bar chart: 7-day completion
  const week = Array.from({ length: 7 }, (_, i) => addDays(now, i - 6));
  const doneCounts = week.map(
    (date) => tasks.filter((t) => t.status === 'selesai' && t.completed_at === date).length,
  );
  const barData = week.map((date, i) => ({
    label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(
      new Date(date + 'T12:00:00Z'),
    ),
    dateLabel: formatDate(date),
    date,
    value: doneCounts[i],
    isToday: date === now,
  }));

  // Donut chart: task status breakdown
  const totalTasks = tasks.length;
  const donutSlices = [
    {
      label: 'Selesai',
      value: tasks.filter((t) => t.status === 'selesai').length,
      color: 'var(--success)',
      cls: 'dot-done',
    },
    {
      label: 'Dikerjakan',
      value: tasks.filter((t) => t.status === 'proses').length,
      color: 'var(--brand)',
      cls: 'dot-active',
    },
    {
      label: 'Rencana',
      value: tasks.filter((t) => t.status === 'rencana').length,
      color: 'var(--pastel-purple-text)',
      cls: 'dot-plan',
    },
    {
      label: 'Dibatalkan',
      value: tasks.filter((t) => t.status === 'dibatalkan').length,
      color: 'var(--danger)',
      cls: 'dot-late',
    },
  ];

  const cash = cashSummary(data['cash-entries'] || []);
  const journalRecent = [...(data.journal || [])]
    .sort((a, b) => String(b.data.date || '').localeCompare(String(a.data.date || '')))
    .slice(0, 3);
  const completedCount = tasks.filter((t) => t.status === 'selesai').length;
  const overdueCount = tasks.filter((t) => isOverdue(t, now)).length;
  const todayMeetingCount = (data.meetings || []).filter((m) => String(m.data.date) === now).length;
  const completion = planProgress(tasks);
  const perhatian = getFollowUps(data, now);

  return (
    <div className="manager-home beranda">
      {/* ── Kepala: tanggal, judul, filter proyek, aksi ─────────── */}
      <header className="home-heading beranda-head">
        <div className="home-heading-text">
          <h1>
            <Ikon3D kind="rumah" size={30} />
            Ringkasan pekerjaan
          </h1>
          <p className="home-date-chip">
            <CalendarDays size={14} aria-hidden />
            <span>{formatDate(now)}</span>
          </p>
        </div>
        <div className="home-heading-actions">
          <label className="beranda-proyek">
            <span className="sr-only">Proyek</span>
            <Select
              value={projectId}
              onChange={(value) => {
                setProjectId(value);
                setSelectedDate('');
              }}
              options={[
                { value: '', label: 'Semua proyek' },
                ...projects.map((project) => ({
                  value: project.id,
                  label: String(project.data.title),
                })),
              ]}
              ariaLabel="Proyek"
            />
          </label>
          <Link href="/jurnal?baru=1" className="home-action-btn home-action-btn-soft">
            Catat kegiatan
          </Link>
          <Link href="/tugas?baru=1" className="home-action-btn">
            + Buat tugas
          </Link>
        </div>
      </header>

      {/* ── KPI ─────────────────────────────────────────────── */}
      <div className="ui-stats-grid">
        <StatCard
          label="Progres tugas"
          value={`${completion}%`}
          percentage={completion}
          sub={`${completedCount} dari ${totalTasks} selesai`}
          variant="emerald"
          accent
          href="/tugas?status=selesai"
        />
        <StatCard
          label="Tugas aktif"
          value={open.length}
          sub="rencana dan dikerjakan"
          icon={<Ikon3D kind="papan" size={34} />}
          variant="blue"
          href="/tugas"
        />
        <StatCard
          label="Terlambat"
          value={overdueCount}
          sub={overdueCount > 0 ? 'perlu diperhatikan' : 'semua sesuai tenggat'}
          icon={<Ikon3D kind="jam" size={34} />}
          variant="rose"
          href="/tugas?status=terlambat"
        />
        <StatCard
          label="Rapat hari ini"
          value={todayMeetingCount}
          sub={meeting ? String(meeting.data.title) : 'tidak ada jadwal'}
          icon={<Ikon3D kind="kalender" size={34} />}
          variant="purple"
          href="/rapat"
        />
      </div>

      {/* ── Grid utama: fokus tugas (kiri), rapat, perhatian, kegiatan (kanan) ── */}
      <div className="beranda-grid">
        <section className="beranda-kartu beranda-tugas" aria-label="Tugas pilihan">
          <div className="beranda-kartu-head">
            <h2>Fokus tugas</h2>
            <div className="beranda-seg" role="group" aria-label="Saring tugas">
              {[
                ['aktif', 'Aktif', open.length],
                ['terlambat', 'Terlambat', tasks.filter((t) => isOverdue(t, now)).length],
                ['selesai', 'Selesai', tasks.filter((t) => t.status === 'selesai').length],
              ].map(([value, label, count]) => (
                <button
                  key={String(value)}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => {
                    setFilter(String(value));
                    setSelectedDate('');
                  }}
                >
                  {label}
                  <span>{count}</span>
                </button>
              ))}
            </div>
          </div>
          {(selectedDate || ['rencana', 'proses', 'dibatalkan'].includes(filter)) && (
            <div className="dashboard-selection" role="status">
              <span>
                {selectedDate ? 'Selesai pada ' + formatDate(selectedDate) : 'Status: ' + filter}
              </span>
              <Button
                onClick={() => {
                  setSelectedDate('');
                  setFilter('aktif');
                }}
              >
                Hapus pilihan
              </Button>
            </div>
          )}
          {visible.length ? (
            <ul className="beranda-baris">
              {visible.slice(0, 7).map((task) => {
                const late = isOverdue(task, now);
                return (
                  <li key={task.id}>
                    <Link href={`/tugas?task=${encodeURIComponent(task.id)}`}>
                      <span className={`beranda-titik is-${late ? 'telat' : task.status}`} aria-hidden="true" />
                      <span className="beranda-baris-teks">
                        <strong>{task.title}</strong>
                        <small>
                          {task.assignee || 'Belum ditugaskan'}
                          {task.subtasks.length > 0 &&
                            ` · ${task.subtasks.filter((st) => st.done).length}/${task.subtasks.length} subtugas`}
                        </small>
                      </span>
                      <span className={`beranda-tanggal${late ? ' is-telat' : ''}`}>{formatDate(task.due_date)}</span>
                      {['tinggi', 'mendesak'].includes(task.priority) && (
                        <span className="beranda-prioritas">{task.priority}</span>
                      )}
                      <ArrowUpRight size={15} className="beranda-panah" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              compact
              ikon="kalender"
              title={filter === 'selesai' ? 'Belum ada tugas selesai' : 'Tidak ada tugas di sini'}
              description={filter === 'terlambat' ? 'Tidak ada tenggat yang terlewat.' : 'Tambahkan tugas dan pilih tanggal pengerjaannya.'}
              action={{ label: 'Tambah tugas', href: '/tugas?baru=1' }}
            />
          )}
          <Link className="home-text-link" href="/tugas">
            Semua tugas <ArrowUpRight size={16} />
          </Link>
        </section>

        <aside className="beranda-samping">
          <Link href={meeting ? recordHref('meetings', meeting) : '/rapat?baru=1'} className="beranda-kartu beranda-rapat">
            <Ikon3D kind="kalender" size={40} />
            <span className="beranda-rapat-teks">
              <small>{meeting ? 'Rapat berikutnya' : 'Agenda rapat'}</small>
              <strong>{meeting ? String(meeting.data.title) : 'Belum ada jadwal rapat'}</strong>
              <span>
                {meeting
                  ? `${formatDate(String(meeting.data.date))} · ${String(meeting.data.time || 'waktu belum diisi')} · ${String(meeting.data.mode || 'tatap muka')}`
                  : 'Jadwalkan rapat koordinasi'}
              </span>
            </span>
            {meetingOnlineUrl ? (
              <a
                href={meetingOnlineUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-join-meeting-direct"
                onClick={(e) => e.stopPropagation()}
                title="Buka ruang rapat daring langsung"
              >
                <Video size={14} />
                <span>Gabung</span>
              </a>
            ) : (
              <ArrowRight size={18} className="beranda-panah" aria-hidden="true" />
            )}
          </Link>

          <section id="perhatian" className="beranda-kartu" aria-label="Perlu perhatian">
            <div className="beranda-kartu-head">
              <h2>Perlu perhatian</h2>
              <span className="beranda-jumlah">{perhatian.length}</span>
            </div>
            {perhatian.length ? (
              <ul className="beranda-baris is-ringkas">
                {perhatian.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <Link href={item.href}>
                      <span className={`beranda-titik is-${item.urgent ? 'telat' : 'rencana'}`} aria-hidden="true" />
                      <span className="beranda-baris-teks">
                        <strong>{item.title}</strong>
                        <small>
                          {item.kind} · {item.reason}
                        </small>
                      </span>
                      <ArrowUpRight size={15} className="beranda-panah" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="beranda-kosong">Tidak ada pengingat pada catatan yang dimuat.</p>
            )}
            {perhatian.length > 5 && (
              <details className="beranda-semua">
                <summary>Lihat semua ({perhatian.length})</summary>
                <FollowUps data={data} />
              </details>
            )}
          </section>

          <section className="beranda-kartu" aria-label="Kegiatan terbaru">
            <div className="beranda-kartu-head">
              <h2>Kegiatan terbaru</h2>
              <Link href="/jurnal" className="beranda-kecil">
                Semua <ArrowUpRight size={13} />
              </Link>
            </div>
            {journalRecent.length ? (
              <ul className="beranda-baris is-ringkas">
                {journalRecent.map((row) => (
                  <li key={row.id}>
                    <Link href={recordHref('journal', row)}>
                      <Ikon3D kind="dumbel" size={22} rapat />
                      <span className="beranda-baris-teks">
                        <strong>{String(row.data.title || '')}</strong>
                        <small>{formatDate(String(row.data.date || ''))}</small>
                      </span>
                      <ArrowUpRight size={15} className="beranda-panah" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                ikon="buku"
                title="Belum ada kegiatan dicatat"
                description="Catat kunjungan, koordinasi, atau hasil lapangan."
                action={{ label: 'Catat kegiatan', href: '/jurnal?baru=1' }}
              />
            )}
          </section>
        </aside>
      </div>

      {/* ── Baris kedua: proyek dan catatan koperasi ──────────── */}
      <div className="beranda-grid-2">
        <section className="beranda-kartu" aria-label="Proyek saya">
          <div className="beranda-kartu-head">
            <h2>Proyek saya</h2>
            <Link href="/proyek" className="beranda-kecil">
              Kelola <ArrowUpRight size={13} />
            </Link>
          </div>
          {visibleProjects.length ? (
            <div className="dash-proj-list">
              {visibleProjects.slice(0, 5).map((p, i) => (
                <ProjectProgressBar
                  key={p.id}
                  label={String(p.data.title)}
                  pct={scopeProgress(tasks.filter((t) => t.workstream_id === p.id))}
                  href={`/proyek?id=${encodeURIComponent(p.id)}`}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              ikon="folder"
              title="Belum ada proyek"
              description={projectId ? 'Tidak ada proyek aktif pada pilihan ini.' : 'Buat proyek atau periksa proyek yang diarsipkan.'}
              action={{ label: 'Kelola proyek', href: '/proyek' }}
            />
          )}
        </section>

        <section className="beranda-kartu" aria-label="Catatan koperasi">
          <div className="beranda-kartu-head">
            <h2>Catatan koperasi</h2>
            <Link href="/pencatatan" className="beranda-kecil">
              Buka buku <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="beranda-angka">
            {(
              [
                ['/anggota', 'kartu', 'Anggota', data.members ? String(data.members.length) : 'Belum aktif'],
                ['/keuangan', 'dompet', 'Selisih kas tercatat', data['cash-entries'] ? rupiah(cash.net) : 'Belum aktif'],
                ['/barang', 'kotak', 'Jenis barang', data['inventory-items'] ? String(data['inventory-items'].length) : 'Belum aktif'],
                ['/stok-opname', 'rak', 'Stok opname', data['stock-counts'] ? String(data['stock-counts'].length) : 'Belum aktif'],
              ] as const
            ).map(([href, ikon, label, nilai]) => (
              <Link key={href} href={href}>
                <Ikon3D kind={ikon} size={26} rapat />
                <small>{label}</small>
                <strong>{nilai}</strong>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ── Lipatan opsional: rutinitas dan grafik ───────────── */}
      <div className="beranda-grid-2 beranda-lipat">
        <details
          className="dashboard-routines beranda-kartu"
          open={routineOpen === 'true'}
          onToggle={(event) => {
            const next = String(event.currentTarget.open);
            if (next !== routineOpen) setRoutineOpen(next);
          }}
        >
          <summary>
            Rutinitas harian
            <span className="beranda-jumlah">
              {routineCompletedCount}/{routines.length} selesai
            </span>
          </summary>
          <div className="home-routine-card">
            <div className="routine-head">
              <div className="routine-title-wrap">
                <Clock size={16} className="routine-icon" />
                <div>
                  <h3>Rutinitas manajer</h3>
                  <small>Checklist operasional harian gerai</small>
                </div>
              </div>
              <div className="routine-head-actions">
                <Button
                  type="button"
                  className="btn-routine-config"
                  onClick={() => setShowRoutineModal(true)}
                  title="Atur checklist rutinitas harian"
                  aria-label="Atur rutinitas"
                >
                  <SlidersHorizontal size={12} />
                  <span>Atur</span>
                </Button>
              </div>
            </div>
            <div className="routine-list">
              {routines.map((item) => {
                const isChecked = completedRoutines.includes(item.id);
                return (
                  <label key={item.id} className={`routine-item ${isChecked ? 'is-done' : ''}`}>
                    <Input type="checkbox" checked={isChecked} onChange={() => toggleRoutine(item.id)} />
                    <span className="routine-time">{item.time}</span>
                    <span className="routine-text">{item.title}</span>
                  </label>
                );
              })}
              {routines.length === 0 && (
                <EmptyState
                  compact
                  ikon="jam"
                  title="Belum ada rutinitas"
                  description="Tambahkan checklist rutinitas harian gerai."
                  action={{ label: 'Atur rutinitas', onClick: () => setShowRoutineModal(true) }}
                />
              )}
            </div>
          </div>
        </details>

        <details
          className="dashboard-extra beranda-kartu"
          open={chartsOpen === 'true'}
          onToggle={(event) => {
            const next = String(event.currentTarget.open);
            if (next !== chartsOpen) setChartsOpen(next);
          }}
        >
          <summary>Grafik pekerjaan</summary>
          <div className="dash-analytics-row">
            <section className="home-panel analytics-panel">
              <div className="section-head">
                <h2>Penyelesaian 7 hari</h2>
              </div>
              <WeekBarChart
                data={barData}
                selectedDate={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(selectedDate === date ? '' : date);
                  setFilter('selesai');
                }}
              />
            </section>
            <section className="home-panel analytics-panel">
              <div className="section-head">
                <h2>Distribusi status tugas</h2>
              </div>
              <TaskDonutChart
                slices={donutSlices}
                total={totalTasks}
                selected={filter}
                onSelect={(status) => {
                  setFilter(status);
                  setSelectedDate('');
                }}
              />
            </section>
          </div>
        </details>
      </div>

      {/* ── Modal Atur Rutinitas Manajer ─────────────────── */}
      {showRoutineModal && (
        <Modal className="sprint-modal-dialog" aria-labelledby="routine-config-title" onDismiss={() => setShowRoutineModal(false)}>
          <div
            className="sprint-modal-card routine-config-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sprint-modal-head">
              <div className="title-with-badge">
                <div className="sprint-icon-pill">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 id="routine-config-title">Atur Rutinitas Harian</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-muted)' }}>
                    Checklist operasional manajer gerai KDMP Puntukrejo
                  </p>
                </div>
              </div>
              <Button
                type="button"
                className="close-btn"
                onClick={() => setShowRoutineModal(false)}
                aria-label="Tutup"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="routine-config-body">
              <form onSubmit={handleAddRoutine} className="routine-add-form">
                <div className="routine-add-inputs">
                  <Input
                    type="time"
                    value={newRoutineTime}
                    onChange={(e) => setNewRoutineTime(e.target.value)}
                    className="routine-time-input"
                    title="Waktu rutinitas"
                    aria-label="Waktu rutinitas baru"
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Tambah rutinitas baru (misal: Cek suhu showcase)..."
                    value={newRoutineTitle}
                    onChange={(e) => setNewRoutineTitle(e.target.value)}
                    className="routine-title-input"
                    aria-label="Judul rutinitas baru"
                    maxLength={120}
                    required
                  />
                </div>
                <Button type="submit" className="btn-add-routine">
                  <Plus size={15} />
                  <span>Tambah</span>
                </Button>
              </form>

              <div className="routine-config-list">
                {routines.map((item) => (
                  <div key={item.id} className="routine-config-item">
                    <span className="routine-time-badge">{item.time}</span>
                    <span className="routine-config-title">{item.title}</span>
                    <Button
                      type="button"
                      className="btn-delete-routine"
                      onClick={() => handleDeleteRoutine(item.id)}
                      title="Hapus rutinitas ini"
                      aria-label={`Hapus ${item.title}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ))}
                {routines.length === 0 && (
                  <p className="routine-empty-hint">Belum ada rutinitas yang diatur.</p>
                )}
              </div>
            </div>

            <div className="routine-modal-footer">
              <Button
                type="button"
                className="btn-reset-routine"
                onClick={handleResetRoutines}
                title="Kembalikan ke rutinitas standar KDMP"
              >
                <RotateCcw size={13} />
                <span>Kembalikan Bawaan</span>
              </Button>
              <Button
                type="button"
                className="btn-primary-finish"
                onClick={() => setShowRoutineModal(false)}
              >
                Selesai
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
