import { SAMPLE_ID_PREFIX, type SampleItem } from './sample-data';
import { daysBetween } from '@/lib/date';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Berkas SEED_DATA_CONTOH.sql. Tanggal disimpan sebagai selisih hari (`@d-3`) lalu dihitung
 * terhadap tanggal Jakarta saat SQL dijalankan, dalam pernyataan INSERT yang sama: mutasi stok
 * tidak boleh di-UPDATE oleh pemicu database, jadi tanggal tidak bisa diperbaiki sesudahnya.
 */
export function sampleSeedSql(rows: SampleItem[], baseDate: string): string {
  const sqlValue = rows.map((r, i) => {
    const data = Object.fromEntries(
      Object.entries(r.data).map(([k, v]) =>
        typeof v === 'string' && DATE_PATTERN.test(v)
          ? [k, `@d${daysBetween(baseDate, v)}`]
          : [k, v],
      ),
    );
    const json = JSON.stringify(data).replace(/'/g, "''");
    return `  ('${r.id}', '${r.entity}', '${json}', ${i})`;
  });
  return `-- SEED DATA CONTOH: Kopdes Management Web (${rows.length} catatan fiktif)
-- Tujuan: proyek yang baru direset (<project-ref>). Jalankan SETELAH berkas reset.
-- Semua nama, nomor, dan angka adalah contoh acak; id diawali ${SAMPLE_ID_PREFIX}.
-- Hapus seluruhnya dengan HAPUS_DATA_CONTOH.sql sebelum mencatat data nyata.
-- Dibuat oleh scripts/build-seed.mjs dari src/features/demo/data-contoh.ts; jangan diedit tangan.
begin;
DO $$
begin
  if exists(select 1 from public.hub_records where id::text like '${SAMPLE_ID_PREFIX}%') then
    raise exception 'Seed dibatalkan: data contoh sudah ada. Jalankan HAPUS_DATA_CONTOH.sql dahulu bila ingin mengulang.';
  end if;
  if exists(select 1 from public.hub_records where entity = 'organization') then
    raise exception 'Seed dibatalkan: profil koperasi sudah ada. Data contoh hanya untuk database kosong.';
  end if;
end $$;
create function pg_temp.tanggal_contoh(j jsonb) returns jsonb language sql as $f$
  select coalesce(jsonb_object_agg(k, case
    when jsonb_typeof(v) = 'string' and (v #>> '{}') ~ '^@d-?[0-9]+$'
      then to_jsonb(((now() at time zone 'Asia/Jakarta')::date + substr(v #>> '{}', 3)::int)::text)
    else v end), '{}'::jsonb)
  from jsonb_each(j) as e(k, v)
$f$;
insert into public.hub_records(id, entity, data, created_at, updated_at)
select id::uuid, entity, pg_temp.tanggal_contoh(data::jsonb),
  now() - make_interval(secs => ${rows.length} - n), now() - make_interval(secs => ${rows.length} - n)
from (values
${sqlValue.join(',\n')}
) as v(id, entity, data, n);
commit;
`;
}

/** Berkas HAPUS_DATA_CONTOH.sql: hapus semua catatan berawalan id contoh, sekaligus. */
export function sampleDeleteSql(): string {
  return `-- HAPUS DATA CONTOH: Kopdes Management Web
-- Menghapus semua catatan yang id-nya diawali ${SAMPLE_ID_PREFIX} (dari SEED_DATA_CONTOH.sql).
-- Berhenti bila ada catatan nyata yang masih merujuk data contoh; ubah rujukannya dahulu.
-- Dibuat oleh scripts/build-seed.mjs; jangan diedit tangan.
begin;
DO $$
declare jumlah integer;
begin
  select count(*) into jumlah from public.hub_records r
  where r.id::text not like '${SAMPLE_ID_PREFIX}%' and (
    exists(select 1 from jsonb_each_text(r.data) p where p.key like '%\\_id' escape '\\' and p.value like '${SAMPLE_ID_PREFIX}%')
    or exists(select 1 from jsonb_array_elements_text(coalesce(r.data->'dependencies', '[]'::jsonb)) d where d like '${SAMPLE_ID_PREFIX}%')
  );
  if jumlah > 0 then
    raise exception 'Penghapusan dibatalkan: % catatan nyata masih merujuk data contoh.', jumlah;
  end if;
end $$;
delete from public.hub_records where id::text like '${SAMPLE_ID_PREFIX}%';
commit;
`;
}
