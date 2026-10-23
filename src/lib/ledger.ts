import type { Item } from '@/features/records/schemas';
export const rupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
export function cashSummary(rows: Item[]) {
  const incoming = rows
    .filter((row) => row.data.direction === 'masuk')
    .reduce((sum, row) => sum + Number(row.data.amount), 0);
  const outgoing = rows
    .filter((row) => row.data.direction === 'keluar')
    .reduce((sum, row) => sum + Number(row.data.amount), 0);
  return { incoming, outgoing, net: incoming - outgoing };
}
export function stockDifference(row: Item) {
  return Number(row.data.counted_quantity) - Number(row.data.book_quantity);
}
// Rumus spreadsheet tetap diamankan walau sel diberi tanda kutip.
export function csvCell(value: unknown) {
  const text = String(value ?? '');
  return '"' + (/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""') + '"';
}

/** Unduh CSV dengan BOM (Excel membaca UTF-8), baris CRLF, dan sel yang aman dari rumus. */
export function downloadCsv(filename: string, header: string[], rows: unknown[][]) {
  const text = '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  link.click();
  URL.revokeObjectURL(url);
}
