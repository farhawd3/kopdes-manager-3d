-- HAPUS DATA CONTOH: Kopdes Management Web
-- Menghapus semua catatan yang id-nya diawali c0de0000 (dari SEED_DATA_CONTOH.sql).
-- Berhenti bila ada catatan nyata yang masih merujuk data contoh; ubah rujukannya dahulu.
-- Dibuat oleh scripts/build-seed.mjs; jangan diedit tangan.
begin;
DO $$
declare jumlah integer;
begin
  select count(*) into jumlah from public.hub_records r
  where r.id::text not like 'c0de0000%' and (
    exists(select 1 from jsonb_each_text(r.data) p where p.key like '%\_id' escape '\' and p.value like 'c0de0000%')
    or exists(select 1 from jsonb_array_elements_text(coalesce(r.data->'dependencies', '[]'::jsonb)) d where d like 'c0de0000%')
  );
  if jumlah > 0 then
    raise exception 'Penghapusan dibatalkan: % catatan nyata masih merujuk data contoh.', jumlah;
  end if;
end $$;
delete from public.hub_records where id::text like 'c0de0000%';
commit;
