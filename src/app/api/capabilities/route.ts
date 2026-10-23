import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { db } from '@/lib/server/db';
import { failure } from '@/lib/server/http';
export async function GET() {
  try {
    await requireSession();
    const [operations, logistics, administration, routines] = await Promise.all([
      db().rpc('hub_operations_ready'),
      db().rpc('hub_logistics_ready'),
      db().rpc('hub_administration_ready'),
      db().rpc('hub_routines_ready'),
    ]);
    for (const { error } of [operations, logistics, administration, routines])
      if (error && !['PGRST202', '42883'].includes(error.code))
        throw new Error('Status modul pencatatan belum dapat diperiksa. Coba lagi.');
    return NextResponse.json(
      {
        operations: !operations.error && operations.data === true,
        // Pengiriman dan mutasi stok membutuhkan migrasi 8 selain modul pencatatan.
        logistics:
          !operations.error &&
          operations.data === true &&
          !logistics.error &&
          logistics.data === true,
        // Aset, absensi, pembelian, penjualan, simpanan: migrasi 10 (menaut anggota dan pengiriman).
        administration:
          !operations.error &&
          operations.data === true &&
          !logistics.error &&
          logistics.data === true &&
          !administration.error &&
          administration.data === true,
        // Rutin harian tersimpan di database: migrasi 11 (dipasang setelah migrasi 1–10).
        routines: !routines.error && routines.data === true,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return failure(error);
  }
}
