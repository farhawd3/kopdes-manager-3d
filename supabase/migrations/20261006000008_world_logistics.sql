-- Migrasi 8: Pengiriman dan mutasi stok (Dunia Koperasi v2, paket 5)
-- Jalankan di cloud hanya setelah disetujui pemilik pada proyek <project-ref>.
-- Menambah dua jenis catatan pada hub_records: 'deliveries' (pengiriman barang masuk/keluar)
-- dan 'stock-movements' (jejak perubahan stok buku). Tidak menghapus tabel, data, atau izin RLS.
-- Stok buku barang hanya berubah lewat hub_post_stock_movement yang mencatat mutasinya
-- dalam satu transaksi; mutasi yang sudah tercatat tidak dapat diubah.
begin;

alter table public.hub_records drop constraint hub_records_entity_check;
alter table public.hub_records add constraint hub_records_entity_check check(
  entity in (
    'organization','workstreams','milestones','work-items','units','checklist',
    'stakeholders','interactions','meetings','decisions','documents','risks','issues',
    'staff','trainings','journal','members','cash-entries','inventory-items','stock-counts',
    'sprints','deliveries','stock-movements'
  )
);

-- Pemeriksaan relasi: tambah delivery_id dan stock_count_id.
create or replace function public.hub_check_relations() returns trigger language plpgsql security definer set search_path = '' as $$
declare current_row public.hub_records; field text; target text; reference_id text; dependency text; has_cycle boolean;
begin
  if TG_OP = 'DELETE' then
    if not exists(select 1 from public.hub_records where id=OLD.id) and exists(
      select 1 from public.hub_records r where
      exists(select 1 from jsonb_each_text(r.data) pair where pair.key like '%\_id' escape '\' and pair.value=OLD.id::text)
      or coalesce(r.data->'dependencies','[]'::jsonb) ? OLD.id::text
    ) then raise exception 'Record is still referenced'; end if;
    return null;
  end if;
  select * into current_row from public.hub_records where id=NEW.id;
  if not found then return null; end if;
  for field,target in select * from (values
    ('item_id','inventory-items'),('workstream_id','workstreams'),('milestone_id','milestones'),('unit_id','units'),
    ('stakeholder_id','stakeholders'),('meeting_id','meetings'),('issue_id','issues'),('staff_id','staff'),
    ('work_item_id','work-items'),('sprint_id','sprints'),('member_id','members'),('document_id','documents'),
    ('delivery_id','deliveries'),('stock_count_id','stock-counts')
  ) as refs(field,target) loop
    reference_id:=current_row.data->>field;
    if coalesce(reference_id,'')<>'' and not exists(select 1 from public.hub_records where id::text=reference_id and entity=target) then
      raise exception 'Missing related record';
    end if;
  end loop;
  if current_row.entity='work-items' then
    for dependency in select jsonb_array_elements_text(coalesce(current_row.data->'dependencies','[]'::jsonb)) loop
      if not exists(select 1 from public.hub_records where id::text=dependency and entity='work-items') then raise exception 'Missing dependency'; end if;
    end loop;
    with recursive walk(id,path,cycle) as (
      select current_row.id::text,array[current_row.id::text],false
      union all
      select edge.value,w.path || edge.value,edge.value=any(w.path)
      from walk w join public.hub_records r on r.id::text=w.id,
      lateral jsonb_array_elements_text(coalesce(r.data->'dependencies','[]'::jsonb)) edge(value)
      where not w.cycle
    ) select exists(select 1 from walk where cycle) into has_cycle;
    if has_cycle then raise exception 'Circular dependency'; end if;
  end if;
  return null;
end $$;

-- Validasi isi pengiriman dan mutasi; mutasi tidak boleh diubah setelah tercatat.
create function public.hub_validate_logistics() returns trigger language plpgsql set search_path='' as $$
declare amount numeric;
begin
  if TG_OP = 'UPDATE' and OLD.entity = 'stock-movements' then
    raise exception 'Stock movements are immutable';
  end if;
  if NEW.entity = 'stock-movements' then
    if coalesce(NEW.data->>'item_id','') = '' then raise exception 'Missing item'; end if;
    if coalesce(NEW.data->>'kind','') not in ('masuk','keluar','koreksi tambah','koreksi kurang') then
      raise exception 'Invalid movement kind';
    end if;
    if jsonb_typeof(NEW.data->'quantity') is distinct from 'number' then raise exception 'Quantity must be a number'; end if;
    amount := (NEW.data->>'quantity')::numeric;
    if amount <> trunc(amount) or amount <= 0 or amount > 1000000000 then raise exception 'Invalid amount or quantity'; end if;
  end if;
  if NEW.entity = 'deliveries' then
    if coalesce(NEW.data->>'direction','') not in ('masuk','keluar') then raise exception 'Invalid delivery direction'; end if;
    if coalesce(NEW.data->>'status','') not in ('dipesan','dikirim','tiba','diperiksa','selesai','dibatalkan') then
      raise exception 'Invalid delivery status';
    end if;
  end if;
  return NEW;
end $$;
create trigger hub_logistics_validation before insert or update on public.hub_records
  for each row execute function public.hub_validate_logistics();

-- Mencatat mutasi dan mengubah stok buku barang secara atomik. Baris barang dikunci agar
-- dua mutasi bersamaan tidak saling menimpa. Stok hasil tidak boleh negatif.
create function public.hub_post_stock_movement(p_data jsonb) returns uuid language plpgsql set search_path='' as $$
declare item public.hub_records; amount numeric; delta numeric; book_before numeric; book_after numeric; movement_id uuid;
begin
  if jsonb_typeof(p_data->'quantity') is distinct from 'number' then raise exception 'Quantity must be a number'; end if;
  amount := (p_data->>'quantity')::numeric;
  if amount <> trunc(amount) or amount <= 0 or amount > 1000000000 then raise exception 'Invalid amount or quantity'; end if;
  delta := case p_data->>'kind'
    when 'masuk' then amount when 'koreksi tambah' then amount
    when 'keluar' then -amount when 'koreksi kurang' then -amount
    else null end;
  if delta is null then raise exception 'Invalid movement kind'; end if;
  select * into item from public.hub_records
    where entity = 'inventory-items' and id::text = p_data->>'item_id' for update;
  if not found then raise exception 'Missing related record'; end if;
  book_before := (item.data->>'book_quantity')::numeric;
  book_after := book_before + delta;
  if book_after < 0 then raise exception 'Stock would be negative'; end if;
  if book_after > 1000000000 then raise exception 'Invalid amount or quantity'; end if;
  update public.hub_records
    set data = jsonb_set(data, '{book_quantity}', to_jsonb(book_after::bigint)), updated_at = now()
    where id = item.id;
  insert into public.hub_records(entity, data)
    values ('stock-movements', p_data || jsonb_build_object('book_before', book_before::bigint, 'book_after', book_after::bigint))
    returning id into movement_id;
  return movement_id;
end $$;

create index if not exists hub_movement_item_idx
  on public.hub_records (((data->>'item_id'))) where entity = 'stock-movements';
create index if not exists hub_delivery_status_idx
  on public.hub_records (((data->>'status'))) where entity = 'deliveries';

create function public.hub_logistics_ready() returns boolean language sql stable set search_path='' as $$ select true $$;
revoke all on function public.hub_validate_logistics(), public.hub_post_stock_movement(jsonb), public.hub_logistics_ready()
  from public, anon, authenticated;
grant execute on function public.hub_post_stock_movement(jsonb), public.hub_logistics_ready() to service_role;

commit;
