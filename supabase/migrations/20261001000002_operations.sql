-- Jalankan hanya setelah disetujui pemilik pada proyek <project-ref>.
-- Menambah empat domain pencatatan; tidak menghapus data atau mengubah izin RLS.
begin;
alter table public.hub_records drop constraint hub_records_entity_check;
alter table public.hub_records add constraint hub_records_entity_check check(entity in ('organization','workstreams','milestones','work-items','units','checklist','stakeholders','interactions','meetings','decisions','documents','risks','issues','staff','trainings','journal','members','cash-entries','inventory-items','stock-counts'));
create unique index hub_member_number on public.hub_records(lower(trim(data->>'member_number'))) where entity='members';
create unique index hub_inventory_sku on public.hub_records(lower(trim(data->>'sku'))) where entity='inventory-items';
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
    ('stakeholder_id','stakeholders'),('meeting_id','meetings'),('issue_id','issues'),('staff_id','staff'),('work_item_id','work-items')
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

create function public.hub_validate_operations() returns trigger language plpgsql set search_path='' as $$
declare field text; value numeric;
begin
  if NEW.entity in ('cash-entries','inventory-items','stock-counts') then
    for field in select unnest(case NEW.entity when 'cash-entries' then array['amount'] when 'inventory-items' then array['book_quantity','minimum_quantity'] else array['book_quantity','counted_quantity'] end) loop
      if jsonb_typeof(NEW.data->field) is distinct from 'number' then raise exception 'Quantity must be a number'; end if;
      value := (NEW.data->>field)::numeric;
      if value<>trunc(value) or value<0 or value>(case when field='amount' then 1000000000000 else 1000000000 end) or (field='amount' and value=0) then raise exception 'Invalid amount or quantity'; end if;
    end loop;
  end if;
  if NEW.entity='cash-entries' and coalesce(NEW.data->>'direction','') not in ('masuk','keluar') then raise exception 'Invalid cash direction'; end if;
  if NEW.entity='members' and length(trim(coalesce(NEW.data->>'member_number','')))=0 then raise exception 'Missing member number'; end if;
  if NEW.entity='inventory-items' and length(trim(coalesce(NEW.data->>'sku','')))=0 then raise exception 'Missing SKU'; end if;
  if NEW.entity='stock-counts' and coalesce(NEW.data->>'item_id','')='' then raise exception 'Missing item'; end if;
  return NEW;
end $$;
create trigger hub_operations_validation before insert or update on public.hub_records for each row execute function public.hub_validate_operations();
create function public.hub_operations_ready() returns boolean language sql stable set search_path='' as $$ select true $$;
revoke all on function public.hub_validate_operations(),public.hub_operations_ready() from public,anon,authenticated;
grant execute on function public.hub_operations_ready() to service_role;
commit;
