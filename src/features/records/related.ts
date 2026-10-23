import { catalog, formatChoiceLabel, labels, options, references } from './catalog';
import type { Entity, Item } from './schemas';
import type { Workspace } from '@/features/workspace/use-workspace';
import { listedIn, sameName } from '@/lib/people';
import { formatDate } from '@/lib/date';
import { rupiah } from '@/lib/ledger';

/** Satu baris "Label: nilai" di bagian Detail. */
export type DetailRow = { field: string; label: string; value: string };
/** Kelompok catatan terkait per jenis, mis. "Pengiriman (2)". */
export type RelatedGroup = {
  entity: Entity;
  title: string;
  direction: 'refers' | 'referenced' | 'name';
  rows: Item[];
};
/** Saran aksi lanjutan; tidak menulis data, hanya membuka form terisi atau halaman. */
export type Suggestion = { id: string; label: string; reason: string; href: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const BLANK = new Set(['', 'belum ditentukan', 'belum diisi', 'otomatis']);
export const MONEY_FIELDS = ['amount', 'price', 'budget', 'value', 'total'];

export const entityTitle = (entity: Entity) => catalog[entity]?.title ?? entity;
export const fieldLabel = (entity: Entity, field: string) =>
  labels[`${entity}.${field}`] ||
  labels[field] ||
  field.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
const titleOf = (row?: Item) => String(row?.data.title ?? '—');
const find = (ws: Workspace, entity: Entity, id: unknown) =>
  id ? (ws[entity] || []).find((row) => row.id === id) : undefined;

/** Nilai siap baca: rujukan → judul catatan, tanggal, rupiah, pilihan berlabel. */
export function displayValue(entity: Entity, field: string, value: unknown, ws: Workspace): string {
  if (value === undefined || value === null || value === '') return '';
  const target = references[field];
  if (target) return titleOf(find(ws, target, value)) || 'Catatan tidak dimuat';
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
  if (Array.isArray(value)) {
    if (field === 'subtasks')
      return `${value.filter((s) => (s as { done?: boolean }).done).length}/${value.length} selesai`;
    if (field === 'dependencies')
      return value.map((id) => titleOf(find(ws, 'work-items', id))).join(', ');
    return value.length ? String(value.length) : '';
  }
  if (typeof value === 'object') return '';
  if (MONEY_FIELDS.includes(field)) return rupiah(Number(value));
  const text = String(value);
  if (DATE.test(text)) return formatDate(text);
  if (BLANK.has(text)) return '';
  // Hanya kolom pilihan yang diberi label; kode, nomor, satuan, dan teks bebas tampil apa adanya.
  const choices = options[`${entity}.${field}`] ?? options[field];
  return choices ? formatChoiceLabel(text, `${entity}.${field}`) || text : text;
}

/** Baris Detail mengikuti urutan kolom katalog; kolom kosong dilewati. */
export function detailRows(entity: Entity, row: Item, ws: Workspace): DetailRow[] {
  const fields = catalog[entity]?.fields ?? Object.keys(row.data);
  return fields
    .filter((field) => field !== 'title' && field !== 'activities')
    .map((field) => ({
      field,
      label: fieldLabel(entity, field),
      value: displayValue(entity, field, row.data[field], ws),
    }))
    .filter((detail) => detail.value);
}

/**
 * Catatan terkait dua arah:
 * - refers: kolom `*_id` catatan ini menunjuk catatan lain;
 * - referenced: catatan lain yang kolom `*_id`-nya (atau prasyarat tugas) menunjuk catatan ini;
 * - name: hubungan lewat nama orang (penanggung jawab, peserta rapat) dengan data Tim.
 */
export function relatedGroups(entity: Entity, row: Item, ws: Workspace): RelatedGroup[] {
  const groups: RelatedGroup[] = [];
  const add = (group: RelatedGroup) => {
    const existing = groups.find(
      (g) => g.entity === group.entity && g.direction === group.direction,
    );
    const rows = group.rows.filter(
      (r) => r.id !== row.id && !(existing?.rows || []).some((x) => x.id === r.id),
    );
    if (!rows.length) return;
    if (existing) existing.rows.push(...rows);
    else groups.push({ ...group, rows });
  };
  for (const [field, target] of Object.entries(references)) {
    const found = find(ws, target, row.data[field]);
    if (found)
      add({
        entity: target,
        title: labels[field] || entityTitle(target),
        direction: 'refers',
        rows: [found],
      });
  }
  if (Array.isArray(row.data.dependencies))
    add({
      entity: 'work-items',
      title: 'Prasyarat',
      direction: 'refers',
      rows: row.data.dependencies.map((id) => find(ws, 'work-items', id)).filter(Boolean) as Item[],
    });
  const pointing = Object.entries(references)
    .filter(([, target]) => target === entity)
    .map(([field]) => field);
  for (const other of Object.keys(ws) as Entity[]) {
    const rows = (ws[other] || []).filter(
      (r) =>
        pointing.some((field) => r.data[field] === row.id) ||
        (entity === 'work-items' &&
          Array.isArray(r.data.dependencies) &&
          r.data.dependencies.includes(row.id)),
    );
    if (rows.length)
      add({ entity: other, title: entityTitle(other), direction: 'referenced', rows });
  }
  // Hubungan lewat nama: staf ↔ tugas/rapat/kegiatan; penanggung jawab ↔ staf.
  const name = String(row.data.title || '');
  if (entity === 'staff' && name) {
    add({
      entity: 'work-items',
      title: 'Tugas',
      direction: 'name',
      rows: (ws['work-items'] || []).filter((t) => sameName(t.data.assignee, name)),
    });
    add({
      entity: 'meetings',
      title: 'Rapat diikuti',
      direction: 'name',
      rows: (ws.meetings || []).filter((m) => listedIn(m.data.participants, name)),
    });
    add({
      entity: 'units',
      title: 'Penanggung jawab gerai',
      direction: 'name',
      rows: (ws.units || []).filter((u) => sameName(u.data.assignee, name)),
    });
  }
  const assignee = String(row.data.assignee || '');
  if (entity !== 'staff' && assignee)
    add({
      entity: 'staff',
      title: 'Penanggung jawab',
      direction: 'name',
      rows: (ws.staff || []).filter((s) => sameName(assignee, String(s.data.title))),
    });
  if (entity === 'meetings')
    add({
      entity: 'staff',
      title: 'Peserta',
      direction: 'name',
      rows: (ws.staff || []).filter((s) => listedIn(row.data.participants, String(s.data.title))),
    });
  return groups;
}

const query = (values: Record<string, string>) =>
  Object.entries(values)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

/** Saran aksi lanjutan per catatan. Hanya membuka form terisi; penyimpanan tetap oleh pengguna. */
export function suggestions(entity: Entity, row: Item, ws: Workspace): Suggestion[] {
  const d = row.data;
  const out: Suggestion[] = [];
  if (
    entity === 'deliveries' &&
    d.direction !== 'keluar' &&
    ['diperiksa', 'selesai'].includes(String(d.status))
  ) {
    if (!(ws['stock-movements'] || []).some((m) => m.data.delivery_id === row.id))
      out.push({
        id: 'stock-in',
        label: 'Catat mutasi masuk',
        reason: 'Barang sudah diperiksa tetapi belum ada mutasi stok dari pengiriman ini.',
        href: `/goods?${query({ tab: 'movements', new: '1', 'fill.delivery_id': row.id, 'fill.kind': 'masuk', 'fill.title': `Terima ${titleOf(row)}` })}`,
      });
  }
  if (
    entity === 'cash-entries' &&
    d.direction === 'keluar' &&
    !d.item_id &&
    /beli|belanja|stok/i.test(`${d.category} ${d.title}`)
  )
    out.push({
      id: 'link-item',
      label: 'Kaitkan barang',
      reason: 'Pengeluaran belanja ini belum terhubung ke barang.',
      href: `/cash?${query({ record: row.id, edit: '1' })}`,
    });
  if (entity === 'meetings') {
    const decisions = (ws.decisions || []).filter((k) => k.data.meeting_id === row.id);
    const existing = new Set(
      (ws['work-items'] || [])
        .filter((t) => t.data.meeting_id === row.id)
        .map((t) => String(t.data.title)),
    );
    for (const decision of decisions.slice(0, 3)) {
      const title = `Tindak lanjut: ${titleOf(decision)}`;
      if (!existing.has(title))
        out.push({
          id: `task-${decision.id}`,
          label: `Buat tugas dari “${titleOf(decision)}”`,
          reason: 'Keputusan rapat belum punya tugas tindak lanjut.',
          href: `/tasks?${query({ new: '1', 'fill.meeting_id': row.id, 'fill.title': title })}`,
        });
    }
  }
  if (entity === 'units' && ['siap uji', 'siap buka', 'persiapan'].includes(String(d.status)))
    out.push({
      id: 'readiness',
      label: 'Cek kesiapan gerai',
      reason: 'Gerai sedang menuju buka; pastikan butir wajib di tab Kesiapan selesai.',
      href: `/store?${query({ tab: 'readiness', new: '1', 'fill.unit_id': row.id, 'fill.title': `Kesiapan ${titleOf(row)}` })}`,
    });
  if (entity === 'inventory-items' && Number(d.book_quantity) < Number(d.minimum_quantity)) {
    out.push({
      id: 'restock',
      label: 'Catat belanja barang',
      reason: `Stok ${String(d.book_quantity)} di bawah minimum ${String(d.minimum_quantity)}.`,
      href: `/cash?${query({ new: '1', direction: 'keluar', 'fill.item_id': row.id, 'fill.category': 'Pembelian', 'fill.title': `Belanja ${titleOf(row)}` })}`,
    });
    out.push({
      id: 'delivery',
      label: 'Jadwalkan pengiriman',
      reason: 'Siapkan kedatangan barang pengganti.',
      href: `/goods?${query({ tab: 'deliveries', new: '1', 'fill.title': `Kiriman ${titleOf(row)}`, 'fill.items': titleOf(row) })}`,
    });
  }
  if (
    entity === 'risks' &&
    d.status === 'terbuka' &&
    !(ws['work-items'] || []).some((t) => String(t.data.title).includes(titleOf(row)))
  )
    out.push({
      id: 'mitigation',
      label: 'Buat tugas mitigasi',
      reason: 'Risiko terbuka belum punya tugas penanganan.',
      href: `/tasks?${query({ new: '1', 'fill.title': `Tangani: ${titleOf(row)}`, 'fill.assignee': String(d.assignee || '') })}`,
    });
  return out;
}

/** Nilai awal form dari parameter `fill.<kolom>` (tautan baru) atau `isi.<kolom>` (tautan lama dari dunia). */
export function prefillFromQuery(params: URLSearchParams): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith('fill.')) values[key.slice(5)] = value;
    else if (key.startsWith('isi.')) values[key.slice(4)] = value;
  }
  return values;
}

/** Cip ringkas di kartu daftar: kolom paling berguna per jenis catatan (maks. 4). */
export function summaryChips(entity: Entity, row: Item, ws: Workspace): string[] {
  const v = (field: string) => displayValue(entity, field, row.data[field], ws);
  const pick = (...parts: (string | false)[]) => parts.filter(Boolean).slice(0, 4) as string[];
  const d = row.data;
  switch (entity) {
    case 'staff':
      return pick(
        v('role'),
        v('section'),
        d.workplace ? `Di ${v('workplace')}` : false,
        d.unit_id ? v('unit_id') : false,
      );
    case 'trainings':
      return pick(v('staff_id'), v('date'), d.required ? 'Wajib' : 'Opsional');
    case 'interactions':
      return pick(v('stakeholder_id'), v('date'));
    case 'risks':
      return pick(
        `Skor ${Number(d.probability || 0) * Number(d.impact || 0)}`,
        d.review_date ? `Tinjau ${v('review_date')}` : false,
      );
    case 'issues':
      return pick(d.due_date ? `Tenggat ${v('due_date')}` : false, v('assignee'));
    case 'decisions':
      return pick(v('date'), d.meeting_id ? `Rapat ${v('meeting_id')}` : false);
    case 'milestones':
      return pick(
        v('workstream_id'),
        d.due_date ? `Tenggat ${v('due_date')}` : false,
        d.actual_date ? `Tercapai ${v('actual_date')}` : false,
      );
    case 'checklist':
      return pick(v('dimension'), v('unit_id'), d.required ? 'Wajib' : false);
    case 'documents':
      return pick(v('kind'), v('number'));
    case 'sprints':
      return pick(v('duration'), d.start_date ? `${v('start_date')} – ${v('end_date')}` : false);
    case 'units':
      return pick(v('kind'), v('location'), v('assignee'));
    case 'assets':
      return pick(v('category'), v('unit_id'), Number(d.value) > 0 && v('value'), v('assignee'));
    case 'attendance':
      return pick(
        v('date'),
        v('shift'),
        d.check_in_time ? `Datang ${v('check_in_time')}` : false,
        d.check_out_time ? `Pulang ${v('check_out_time')}` : false,
      );
    case 'purchase-orders':
      return pick(
        v('stakeholder_id'),
        Number(d.total) > 0 && v('total'),
        d.expected_date ? `Tiba ${v('expected_date')}` : false,
      );
    case 'sales':
      return pick(v('date'), `Omzet ${v('amount')}`, `${Number(d.transactions || 0)} transaksi`);
    case 'savings':
      return pick(
        v('date'),
        `${d.direction === 'tarik' ? 'Tarik' : 'Setor'} ${v('amount')}`,
        `Simpanan ${String(d.kind)}`,
      );
    case 'deliveries':
      return pick(
        v('direction'),
        v('stakeholder_id'),
        d.planned_date ? `Rencana ${v('planned_date')}` : false,
        v('unit_id'),
      );
    case 'stock-movements':
      return pick(v('item_id'), v('kind'), `${Number(d.quantity || 0)} unit`, v('date'));
    case 'journal':
      return pick(v('date'), v('work_item_id'), v('stakeholder_id'), v('unit_id'));
    default:
      return [];
  }
}
