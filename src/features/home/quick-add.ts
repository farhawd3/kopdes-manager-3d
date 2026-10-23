import { addDays } from '@/lib/date';

export type Priority = 'rendah' | 'normal' | 'tinggi' | 'mendesak';
export type TaskDraft = {
  title: string;
  assignee?: string;
  workstream_id?: string;
  priority?: Priority;
  due_date?: string;
};

const DAY_NAMES = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
const DAY_OFFSETS: Record<string, number> = { 'hari ini': 0, besok: 1, lusa: 2 };

/** Hari bernama berikutnya setelah hari ini: "senin" pada hari Senin berarti Senin depan. */
function nextNamedDay(today: string, index: number): string {
  const current = new Date(today + 'T12:00:00Z').getUTCDay();
  return addDays(today, (index - current + 7) % 7 || 7);
}

/** Tanggal dari "tgl/bln"; bila sudah lewat tahun ini, berarti tahun depan. */
function dateFromNumbers(today: string, day: number, month: number): string | undefined {
  let year = Number(today.slice(0, 4));
  const iso = (y: number) => `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const valid = (value: string) => {
    const date = new Date(value + 'T12:00:00Z');
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if (!valid(iso(year))) return undefined;
  if (iso(year) < today) year += 1;
  return valid(iso(year)) ? iso(year) : undefined;
}

/**
 * Membaca kalimat tambah cepat, misalnya "Cek stok gula @Budi #gerai besok !tinggi".
 * @nama menjadi penanggung jawab (dicocokkan ke nama di Tim, kalau tidak ada dipakai apa adanya),
 * #kata menjadi proyek yang judulnya memuat kata itu, !prioritas, dan kata waktu (hari ini, besok,
 * lusa, nama hari, atau tgl/bln). Bagian yang tidak dikenali tetap menjadi judul agar tidak hilang.
 */
export function parseQuickAdd(
  text: string,
  context: { today: string; staff: string[]; projects: { id: string; title: string }[] },
): TaskDraft {
  const draft: TaskDraft = { title: '' };
  let rest = ` ${text.trim()} `;
  const take = (pattern: RegExp, apply: (match: RegExpMatchArray) => boolean) => {
    const match = rest.match(pattern);
    if (match && apply(match)) rest = rest.replace(match[0], ' ');
  };
  // Garis bawah menggantikan spasi: "@Pak_Joko" berarti "Pak Joko".
  take(/\s@([\p{L}\p{N}_.'-]+)/u, ([, word]) => {
    const name = word.replace(/_/g, ' ');
    const lower = name.toLowerCase();
    draft.assignee =
      context.staff.find((person) => person.toLowerCase().startsWith(lower)) ??
      name.replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
    return true;
  });
  take(/\s#([\p{L}\p{N}-]+)/u, ([, word]) => {
    const project = context.projects.find((p) => p.title.toLowerCase().includes(word.toLowerCase()));
    if (project) draft.workstream_id = project.id;
    return Boolean(project);
  });
  take(/\s!(rendah|normal|tinggi|mendesak)(?=\s)/i, ([, priority]) => {
    draft.priority = priority.toLowerCase() as Priority;
    return true;
  });
  take(/\s(hari ini|besok|lusa)(?=\s)/i, ([, word]) => {
    draft.due_date = addDays(context.today, DAY_OFFSETS[word.toLowerCase()]);
    return true;
  });
  if (!draft.due_date)
    take(new RegExp(`\\s(${DAY_NAMES.join('|')})(?=\\s)`, 'i'), ([, day]) => {
      draft.due_date = nextNamedDay(context.today, DAY_NAMES.indexOf(day.toLowerCase()));
      return true;
    });
  if (!draft.due_date)
    take(/\s(\d{1,2})\/(\d{1,2})(?=\s)/, ([, day, month]) => {
      // Jangan menulis due_date kosong: nilai undefined akan menimpa tanggal bawaan form.
      const date = dateFromNumbers(context.today, Number(day), Number(month));
      if (date) draft.due_date = date;
      return Boolean(date);
    });
  draft.title = rest.replace(/\s+/g, ' ').trim() || 'Tugas baru';
  return draft;
}

/** Jam "HH:MM" ditambah sejumlah menit, dibatasi 23:59 (rapat tidak melewati tengah malam). */
export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(23 * 60 + 59, h * 60 + m + Math.max(0, minutes));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Selisih menit dua jam "HH:MM" pada hari yang sama. */
export function minutesBetween(from: string, to: string): number {
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
  return minutes(to) - minutes(from);
}

/** Teks hitung mundur yang ringkas: "1 menit lagi", "47 menit lagi", "2 jam 5 menit lagi". */
export function countdownText(minutes: number): string {
  if (minutes <= 0) return 'Mulai sekarang';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours ? `${hours} jam ` : ''}${rest ? `${rest} menit ` : ''}lagi`;
}

export type DailyReportInput = {
  date: string;
  coop?: string;
  routines: { title: string; time: string; done: boolean }[];
  tasks: { title: string; status: string; due: string; completedAt?: string; assignee?: string }[];
  meetings?: { title: string; time?: string; kind?: string }[];
  activities?: { title: string }[];
};

const dotted = (time: string) => time.replace(':', '.');

/**
 * Menyusun laporan kerja harian berupa teks polos yang siap ditempel ke grup WhatsApp pengurus.
 * Bagian yang datanya tidak dimuat (undefined) dilewati, bukan ditulis "tidak ada".
 */
export function buildDailyReport(input: DailyReportInput): string {
  const date = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(input.date + 'T12:00:00Z'));
  const open = (status: string) => !['selesai', 'dibatalkan'].includes(status);
  const doneToday = input.tasks.filter((t) => t.status === 'selesai' && t.completedAt === input.date);
  const dueToday = input.tasks.filter((t) => open(t.status) && t.due === input.date);
  const late = input.tasks.filter((t) => open(t.status) && Boolean(t.due) && t.due < input.date);
  const who = (name?: string) => (name ? ` (${name})` : '');
  const lines: string[] = ['Laporan kerja harian', [date, input.coop].filter(Boolean).join(' · ')];
  const section = (title: string, body: string[]) => {
    if (body.length) lines.push('', title, ...body);
  };
  if (input.routines.length) {
    const finished = input.routines.filter((r) => r.done).length;
    section(
      `Rutin harian: ${finished} dari ${input.routines.length} selesai`,
      input.routines.map((r) => `${r.done ? '✓' : '○'} ${dotted(r.time)} ${r.title}`),
    );
  }
  section(`Tugas selesai hari ini (${doneToday.length})`, doneToday.map((t) => `- ${t.title}${who(t.assignee)}`));
  section(`Jatuh tempo hari ini (${dueToday.length})`, dueToday.map((t) => `- ${t.title}${who(t.assignee)}`));
  section(`Terlambat (${late.length})`, late.map((t) => `- ${t.title}${who(t.assignee)}, tenggat ${t.due}`));
  if (input.meetings)
    section(
      'Agenda hari ini',
      input.meetings.map(
        (m) => `- ${m.time ? dotted(m.time) + ' ' : ''}${m.title}${m.kind && m.kind !== 'Rapat' ? ` (${m.kind.toLowerCase()})` : ''}`,
      ),
    );
  if (input.activities) section('Kegiatan tercatat', input.activities.map((a) => `- ${a.title}`));
  if (lines.length === 2) lines.push('', 'Belum ada pekerjaan tercatat hari ini.');
  return lines.join('\n');
}
