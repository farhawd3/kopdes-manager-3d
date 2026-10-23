import type { Entity } from './schemas';

// Konstanta tanpa Zod: aman dipakai di browser tanpa ikut memuat skema validasi.
export const statuses = ['rencana', 'proses', 'selesai', 'dibatalkan'] as const;
// Jenis agenda (keputusan pemilik 20 Okt 2026): rapat, kunjungan ke pemasok/sales/mitra, acara, atau lainnya.
export const jenisAgenda = ['rapat', 'kunjungan', 'acara', 'lainnya'] as const;
export const operationEntities: Entity[] = [
  'members',
  'cash-entries',
  'inventory-items',
  'stock-counts',
];
/** Aktif setelah migrasi 8 (pengiriman dan mutasi stok) terpasang. */
export const logisticsEntities: Entity[] = ['deliveries', 'stock-movements'];
/** Aktif setelah migrasi 10 (administrasi usaha) terpasang. */
export const administrationEntities: Entity[] = [
  'assets',
  'attendance',
  'purchase-orders',
  'sales',
  'savings',
];
/** Aktif setelah migrasi 11 (rutin harian) terpasang. */
export const routineEntities: Entity[] = ['routines', 'routine-checks'];
