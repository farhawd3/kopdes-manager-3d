import type { Item } from '../records/schemas';
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
// Spreadsheet formulas are escaped even when a cell is quoted.
export function csvCell(value: unknown) {
  const text = String(value ?? '');
  return '"' + (/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""') + '"';
}
