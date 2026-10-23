import { CalendarDays, Handshake, Megaphone, Users, type LucideIcon } from 'lucide-react';
import type { Item } from '../records/schemas';
import { jenisAgenda } from '../records/constants';

export type MeetingKind = (typeof jenisAgenda)[number];

/** Label dan ikon tiap jenis agenda; warna selalu disertai label. */
export const MEETING_KINDS: Record<MeetingKind, { label: string; icon: LucideIcon }> = {
  rapat: { label: 'Rapat', icon: Users },
  kunjungan: { label: 'Kunjungan', icon: Handshake },
  acara: { label: 'Acara', icon: Megaphone },
  lainnya: { label: 'Lainnya', icon: CalendarDays },
};

/** Jenis agenda sebuah catatan; data lama tanpa jenis dianggap rapat. */
export function meetingKindOf(row: Item): MeetingKind {
  const value = String(row.data.jenis || '');
  return (jenisAgenda as readonly string[]).includes(value) ? (value as MeetingKind) : 'rapat';
}

/** Formulir kegiatan yang sudah terisi hasil agenda: judul, tanggal, dan tautan ke agendanya. */
export function recordOutcomeHref(row: Item, date: string): string {
  return `/notes?${new URLSearchParams({
    new: '1',
    'fill.meeting_id': row.id,
    'fill.title': `Hasil: ${String(row.data.title)}`,
    'fill.date': date,
  })}`;
}
