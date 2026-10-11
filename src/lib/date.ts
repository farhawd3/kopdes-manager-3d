export function today(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function addDays(value: string, amount: number): string {
  const date = new Date(value + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
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
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}
