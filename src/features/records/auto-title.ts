import type { Workspace } from '@/features/workspace/use-workspace';
import type { Entity } from './schemas';

const nameOf = (workspace: Workspace, entity: Entity, id: unknown) =>
  String(workspace[entity]?.find((row) => row.id === id)?.data.title || '');

/**
 * Absensi, penjualan harian, dan simpanan tidak punya kolom judul di formulir: judulnya
 * diturunkan dari petugas, gerai, atau anggota agar daftar dan pencarian tetap terbaca.
 */
export function autoTitle(
  entity: Entity,
  values: Record<string, unknown>,
  workspace: Workspace,
): string | null {
  if (entity === 'attendance') return nameOf(workspace, 'staff', values.staff_id) || 'Petugas';
  if (entity === 'sales')
    return `Penjualan ${nameOf(workspace, 'units', values.unit_id) || 'gerai'}`;
  if (entity === 'savings')
    return `Simpanan ${String(values.kind || 'anggota')} · ${nameOf(workspace, 'members', values.member_id) || 'anggota'}`;
  return null;
}
