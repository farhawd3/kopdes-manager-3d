import type { Entity, Item } from '../records/schemas';
import type { Workspace } from './useWorkspace';
import { catalog, pages } from '../records/catalog';
import { addDays } from '@/lib/date';

export function recordHref(entity: Entity, row: Item) {
  if (entity === 'workstreams') return `/proyek?id=${encodeURIComponent(row.id)}`;
  if (entity === 'work-items') return `/tugas?task=${encodeURIComponent(row.id)}`;
  if (entity === 'stakeholders' || entity === 'interactions')
    return `/mitra?bagian=${entity}&record=${encodeURIComponent(row.id)}`;
  const books: Partial<Record<Entity, string>> = {
    members: 'anggota',
    'cash-entries': 'keuangan',
    'inventory-items': 'barang',
    'stock-counts': 'stok-opname',
  };
  const slug = books[entity] || Object.keys(pages).find((key) => pages[key].includes(entity));
  return slug ? `/${slug}?bagian=${entity}&record=${encodeURIComponent(row.id)}` : '/proyek';
}

export function searchWorkspace(data: Workspace, text: string, scope = 'all') {
  const words = text.toLocaleLowerCase('id').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return (Object.keys(data) as Entity[])
    .filter((entity) => scope === 'all' || entity === scope)
    .flatMap((entity) =>
      (data[entity] || [])
        .filter((row) => {
          // Search loaded records only. Nothing is sent to a third-party search service.
          const project = data.workstreams?.find(
            (project) => project.id === row.data.workstream_id,
          );
          const content = [...Object.values(row.data), project?.data.title]
            .filter((value) => typeof value === 'string')
            .join(' ')
            .toLocaleLowerCase('id');
          return words.every((word) => content.includes(word));
        })
        .map((row) => ({
          id: `${entity}:${row.id}`,
          title: String(row.data.title),
          kind: catalog[entity].title,
          entity,
          context: String(
            data.workstreams?.find((project) => project.id === row.data.workstream_id)?.data
              .title || '',
          ),
          href: recordHref(entity, row),
        })),
    )
    .slice(0, 30);
}

export type FollowUp = {
  id: string;
  title: string;
  reason: string;
  kind: string;
  href: string;
  urgent: boolean;
};
export function getFollowUps(data: Workspace, date: string): FollowUp[] {
  const result: FollowUp[] = [];
  const add = (entity: Entity, row: Item, reason: string, urgent = false) =>
    result.push({
      id: `${entity}:${row.id}`,
      title: String(row.data.title),
      reason,
      kind: catalog[entity].title,
      href: recordHref(entity, row),
      urgent,
    });
  for (const row of data['work-items'] || []) {
    if (
      !['selesai', 'dibatalkan'].includes(String(row.data.status)) &&
      row.data.due_date &&
      String(row.data.due_date) <= date
    )
      add(
        'work-items',
        row,
        row.data.due_date === date ? 'Tenggat hari ini' : 'Tenggat terlewat',
        row.data.due_date !== date,
      );
  }
  for (const row of data.meetings || []) {
    const meetingDate = String(row.data.date || '');
    if (
      meetingDate >= date &&
      meetingDate <= addDays(date, 7) &&
      !['selesai', 'dibatalkan'].includes(String(row.data.status))
    )
      add('meetings', row, meetingDate === date ? 'Rapat hari ini' : `Rapat pada ${meetingDate}`);
  }
  for (const row of data.documents || []) {
    const expiry = String(row.data.expires_date || '');
    if (expiry && expiry <= addDays(date, 30))
      add(
        'documents',
        row,
        expiry < date ? 'Masa berlaku habis' : 'Berakhir dalam 30 hari',
        expiry < date,
      );
  }
  for (const row of data.issues || []) {
    if (row.data.status !== 'ditutup' && String(row.data.due_date) <= date)
      add('issues', row, 'Kendala perlu ditinjau', true);
  }
  for (const row of data.risks || []) {
    if (
      row.data.status !== 'ditutup' &&
      row.data.review_date &&
      String(row.data.review_date) <= date
    )
      add('risks', row, 'Jadwal tinjau risiko');
  }
  for (const row of data['inventory-items'] || []) {
    if (Number(row.data.book_quantity) <= Number(row.data.minimum_quantity))
      add(
        'inventory-items',
        row,
        `Stok buku ${row.data.book_quantity}; batas minimum ${row.data.minimum_quantity}`,
        Number(row.data.book_quantity) === 0,
      );
  }
  // Latest count per item avoids showing historical discrepancies as current stock.
  const latest = new Map<string, Item>();
  for (const row of data['stock-counts'] || []) {
    const key = String(row.data.item_id);
    const previous = latest.get(key);
    if (
      !previous ||
      `${row.data.date}${row.created_at}` > `${previous.data.date}${previous.created_at}`
    )
      latest.set(key, row);
  }
  for (const row of latest.values())
    if (Number(row.data.counted_quantity) !== Number(row.data.book_quantity))
      add('stock-counts', row, 'Opname terakhir memiliki selisih; periksa catatannya');
  return result.sort(
    (a, b) => Number(b.urgent) - Number(a.urgent) || a.title.localeCompare(b.title, 'id'),
  );
}
