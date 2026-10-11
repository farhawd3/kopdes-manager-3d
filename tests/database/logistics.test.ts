// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let database: PGlite;
const insert = (id: string, entity: string, data: Record<string, unknown>) =>
  database.query('insert into public.hub_records(id,entity,data) values($1,$2,$3::jsonb)', [
    id,
    entity,
    JSON.stringify(data),
  ]);
const stockOf = async (id: string) =>
  (
    await database.query<{ qty: number }>(
      "select (data->>'book_quantity')::int as qty from public.hub_records where id=$1",
      [id],
    )
  ).rows[0].qty;
const post = (data: Record<string, unknown>) =>
  database.query<{ id: string }>('select public.hub_post_stock_movement($1::jsonb) as id', [
    JSON.stringify(data),
  ]);

beforeAll(async () => {
  database = new PGlite();
  await database.exec(
    'create role anon; create role authenticated; create role service_role bypassrls;',
  );
  for (const file of readdirSync('supabase/migrations')
    .filter((name) => name.endsWith('.sql'))
    .sort())
    await database.exec(readFileSync(`supabase/migrations/${file}`, 'utf8'));
}, 60000);
afterAll(async () => {
  await database?.close();
});

describe('Migrasi 8: pengiriman dan mutasi stok', () => {
  it('fungsi logistik hanya dapat dipanggil server', async () => {
    const result = await database.query<{ ready: boolean; anon: boolean; user: boolean }>(
      `select public.hub_logistics_ready() as ready,
        has_function_privilege('anon','public.hub_post_stock_movement(jsonb)','EXECUTE') as anon,
        has_function_privilege('authenticated','public.hub_post_stock_movement(jsonb)','EXECUTE') as user`,
    );
    expect(result.rows[0]).toEqual({ ready: true, anon: false, user: false });
  });

  it('mutasi mencatat stok sebelum/sesudah dan mengubah stok buku dalam satu langkah', async () => {
    const item = randomUUID();
    await insert(item, 'inventory-items', {
      title: 'Beras uji',
      sku: 'UJI-BERAS',
      book_quantity: 10,
      minimum_quantity: 5,
      measurement: 'karung',
    });
    const masuk = await post({ title: 'Terima', item_id: item, kind: 'masuk', quantity: 15 });
    expect(await stockOf(item)).toBe(25);
    await post({ title: 'Kirim ke gerai', item_id: item, kind: 'keluar', quantity: 5 });
    await post({ title: 'Koreksi opname', item_id: item, kind: 'koreksi kurang', quantity: 2 });
    expect(await stockOf(item)).toBe(18);
    const row = await database.query<{ before: number; after: number }>(
      "select (data->>'book_before')::int as before, (data->>'book_after')::int as after from public.hub_records where id=$1",
      [masuk.rows[0].id],
    );
    expect(row.rows[0]).toEqual({ before: 10, after: 25 });
  });

  it('menolak stok negatif tanpa mengubah stok atau mencatat mutasi', async () => {
    const item = randomUUID();
    await insert(item, 'inventory-items', {
      title: 'Minyak uji',
      sku: 'UJI-MINYAK',
      book_quantity: 3,
      minimum_quantity: 0,
      measurement: 'botol',
    });
    await expect(
      post({ title: 'Terlalu banyak', item_id: item, kind: 'keluar', quantity: 4 }),
    ).rejects.toThrow('Stock would be negative');
    await expect(
      post({ title: 'Nol', item_id: item, kind: 'masuk', quantity: 0 }),
    ).rejects.toThrow();
    await expect(
      post({ title: 'Jenis salah', item_id: item, kind: 'hilang', quantity: 1 }),
    ).rejects.toThrow('Invalid movement kind');
    expect(await stockOf(item)).toBe(3);
    const count = await database.query<{ total: number }>(
      "select count(*)::int as total from public.hub_records where entity='stock-movements' and data->>'item_id'=$1",
      [item],
    );
    expect(count.rows[0].total).toBe(0);
  });

  it('mutasi tidak dapat diubah dan barang bermutasi tidak dapat dihapus', async () => {
    const item = randomUUID();
    await insert(item, 'inventory-items', {
      title: 'Gula uji',
      sku: 'UJI-GULA',
      book_quantity: 1,
      minimum_quantity: 0,
      measurement: 'pak',
    });
    const { rows } = await post({ title: 'Terima', item_id: item, kind: 'masuk', quantity: 1 });
    await expect(
      database.query(
        "update public.hub_records set data = jsonb_set(data,'{quantity}','99') where id=$1",
        [rows[0].id],
      ),
    ).rejects.toThrow('immutable');
    await expect(
      database.query('delete from public.hub_records where id=$1', [item]),
    ).rejects.toThrow('Record is still referenced');
  });

  it('pengiriman memvalidasi arah, status dan relasi mutasi', async () => {
    const delivery = randomUUID();
    await insert(delivery, 'deliveries', {
      title: 'Kiriman uji',
      direction: 'masuk',
      status: 'tiba',
    });
    await expect(
      insert(randomUUID(), 'deliveries', { title: 'Salah', direction: 'masuk', status: 'hilang' }),
    ).rejects.toThrow('Invalid delivery status');
    const item = randomUUID();
    await insert(item, 'inventory-items', {
      title: 'Tepung uji',
      sku: 'UJI-TEPUNG',
      book_quantity: 0,
      minimum_quantity: 0,
      measurement: 'pak',
    });
    await post({
      title: 'Dari kiriman',
      item_id: item,
      kind: 'masuk',
      quantity: 4,
      delivery_id: delivery,
    });
    await expect(
      post({
        title: 'Kiriman hilang',
        item_id: item,
        kind: 'masuk',
        quantity: 1,
        delivery_id: randomUUID(),
      }),
    ).rejects.toThrow('Missing related record');
    expect(await stockOf(item)).toBe(4);
  });
});
