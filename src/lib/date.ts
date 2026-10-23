// Pemformat dibuat sekali: membuat Intl.DateTimeFormat di setiap panggilan mahal untuk daftar panjang.
const JAKARTA_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const MONTH_LABEL = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const DATE_LABEL = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const DATE_TIME_LABEL = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
});

export function today(now = new Date()): string {
  return JAKARTA_DATE.format(now);
}
const JAKARTA_TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
/** Jam WIB "HH:MM" (00–23). */
export function jakartaTime(now: Date | number = new Date()): string {
  return JAKARTA_TIME.format(now);
}
export function addDays(value: string, amount: number): string {
  const date = new Date(value + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}
/** Rentang satu bulan kalender; `shift` -1 = bulan lalu. Akhir bulan berjalan dibatasi `until` (hari ini). */
export function monthRange(
  value: string,
  shift = 0,
  until = value,
): { start: string; end: string; label: string } {
  const first = new Date(value.slice(0, 7) + '-01T12:00:00Z');
  first.setUTCMonth(first.getUTCMonth() + shift);
  const start = first.toISOString().slice(0, 10);
  const last = new Date(first);
  last.setUTCMonth(last.getUTCMonth() + 1, 0);
  const end = last.toISOString().slice(0, 10);
  const label = MONTH_LABEL.format(first);
  return { start, end: end > until ? until : end, label };
}
/** Tujuh tanggal Senin–Minggu dari pekan yang memuat `value` (pekan Indonesia dimulai Senin). */
export function weekDays(value: string): string[] {
  const weekday = new Date(value + 'T12:00:00Z').getUTCDay();
  const monday = addDays(value, -((weekday + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
export function daysBetween(start: string, end: string): number {
  return Math.round((Date.parse(end + 'T12:00:00Z') - Date.parse(start + 'T12:00:00Z')) / 86400000);
}
export function nextOccurrence(value: string, recurrence: string): string {
  if (recurrence === 'harian') return addDays(value, 1);
  if (recurrence === 'mingguan') return addDays(value, 7);
  const current = new Date(value + 'T12:00:00Z');
  const day = current.getUTCDate();
  current.setUTCDate(1);
  current.setUTCMonth(current.getUTCMonth() + 1);
  const last = new Date(
    Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 0),
  ).getUTCDate();
  current.setUTCDate(Math.min(day, last));
  return current.toISOString().slice(0, 10);
}
export function formatDate(value?: string | null): string {
  if (!value || value === 'undefined' || value === 'null') {
    return 'Belum ditentukan';
  }
  const dateStr = value.length === 10 ? value + 'T12:00:00Z' : value;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    return 'Belum ditentukan';
  }
  return DATE_LABEL.format(parsed);
}

export function formatDateTime(value?: string | null): string {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return '—';
  return DATE_TIME_LABEL.format(parsed) + ' WIB';
}
