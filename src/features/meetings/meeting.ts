import { schemas, type Item } from '../records/schemas';

/** Tautan rapat online yang sah, atau null bila tidak layak ditampilkan. */
export function meetingJoinUrl(meeting: Item | undefined): string | null {
  if (!meeting) return null;
  const data = meeting.data;
  const mode = String(data.mode || 'tatap muka');
  if (mode !== 'online' && mode !== 'hybrid') return null;
  const url = String(data.meeting_url || '').trim();
  if (!/^https?:\/\/\S+$/i.test(url)) return null;
  return url;
}

const escape = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r', '')
    .replaceAll('\n', '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,');
const stamp = (value: Date) =>
  value
    .toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replace(/\.\d{3}Z$/, 'Z');
export function meetingCalendar(item: Item, now = new Date()) {
  const data = schemas.meetings.parse(item.data);
  const start = new Date(`${data.date}T${data.time}:00+07:00`);
  const end = new Date(start.getTime() + data.duration * 60_000);
  // Fold by UTF-8 bytes, preserving complete Unicode characters (RFC 5545).
  const fold = (line: string) => {
    let result = '',
      count = 0;
    for (const char of line) {
      const size = new TextEncoder().encode(char).length;
      if (count + size > 74) {
        result += '\r\n ';
        count = 1;
      }
      result += char;
      count += size;
    }
    return result;
  };
  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kopdes//Meeting//ID',
      'BEGIN:VEVENT',
      `UID:${escape(item.id)}@kopdes`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escape(data.title)}`,
      `DESCRIPTION:${escape([data.agenda, data.meeting_url].filter(Boolean).join('\n'))}`,
      `LOCATION:${escape(data.location || data.meeting_url)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .map(fold)
      .join('\r\n') + '\r\n'
  );
}
export function downloadMeeting(item: Item) {
  const url = URL.createObjectURL(
    new Blob([meetingCalendar(item)], { type: 'text/calendar;charset=utf-8' }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'rapat.ics';
  anchor.click();
  URL.revokeObjectURL(url);
}
