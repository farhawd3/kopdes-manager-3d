-- Hanya untuk proyek Supabase BARU. Tidak menyentuh database lama.
-- Data domain divalidasi Zod di server; JSONB menjaga fondasi tetap kecil.
begin;
create table public.hub_records (
  id uuid primary key default gen_random_uuid(),
  entity text not null check (entity in ('organization','workstreams','milestones','work-items','units','checklist','stakeholders','interactions','meetings','decisions','documents','risks','issues','staff','trainings','journal')),
  data jsonb not null check (jsonb_typeof(data) = 'object' and length(trim(data->>'title')) > 0),
  recurrence_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hub_records_entity on public.hub_records(entity, created_at);
create unique index hub_single_organization on public.hub_records(entity) where entity = 'organization';
create unique index hub_unique_workstream_code on public.hub_records((data->>'code')) where entity = 'workstreams';
create table public.manager_security (
  id boolean primary key default true check(id),
  pin_hash text,
  attempts integer not null default 0,
  blocked_until timestamptz,
  next_attempt_at timestamptz
);
insert into public.manager_security(id) values(true);
create table public.manager_sessions (
  token_hash text primary key,
  expires_at timestamptz not null
);
create table public.manager_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  period_start date not null,
  period_end date not null check(period_end >= period_start),
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create table public.activity_log (
  id bigint generated always as identity primary key,
  entity text not null,
  record_id uuid not null,
  action text not null,
  created_at timestamptz not null default now()
);
create table public.template_runs (key text primary key, created_at timestamptz not null default now());

create function public.hub_changed() returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'UPDATE' then NEW.updated_at := now(); return NEW; end if;
  return NEW;
end $$;
create trigger hub_timestamp before update on public.hub_records for each row execute function public.hub_changed();
create function public.hub_log() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'DELETE' then
    insert into public.activity_log(entity,record_id,action) values(OLD.entity,OLD.id,TG_OP); return OLD;
  end if;
  insert into public.activity_log(entity,record_id,action) values(NEW.entity,NEW.id,TG_OP); return NEW;
end $$;
create trigger hub_activity after insert or update or delete on public.hub_records for each row execute function public.hub_log();

-- Relasi diperiksa pada akhir transaksi: seed/pulihkan boleh memasukkan anak lebih dahulu.
create function public.hub_check_relations() returns trigger language plpgsql security definer set search_path = '' as $$
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
    ('workstream_id','workstreams'),('milestone_id','milestones'),('unit_id','units'),
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
create constraint trigger hub_relations after insert or update or delete on public.hub_records deferrable initially deferred for each row execute function public.hub_check_relations();

-- Satu baris terkunci: pembatasan bertahan pada banyak proses/server.
create function public.reserve_pin_attempt() returns text language plpgsql security definer set search_path = '' as $$
declare access public.manager_security;
begin
  select * into access from public.manager_security where id = true for update;
  if access.pin_hash is null then return null; end if;
  if access.blocked_until > now() or access.next_attempt_at > now() then return null; end if;
  if access.blocked_until is not null and access.blocked_until <= now() then access.attempts := 0; end if;
  update public.manager_security set attempts = access.attempts + 1,
    blocked_until = case when access.attempts + 1 >= 5 then now() + interval '15 minutes' else null end,
    next_attempt_at = now() + make_interval(secs => power(2, least(access.attempts,4))::integer)
    where id = true;
  return access.pin_hash;
end $$;
create function public.finish_pin_login(expected_hash text, session_hash text) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.manager_security where id = true and pin_hash = expected_hash for update;
  if not found then return false; end if;
  update public.manager_security set attempts=0,blocked_until=null,next_attempt_at=null where id=true;
  delete from public.manager_sessions where expires_at <= now();
  insert into public.manager_sessions(token_hash,expires_at) values(session_hash,now()+interval '12 hours');
  return true;
end $$;
create function public.initialize_manager(hash text) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.manager_security set pin_hash=hash where id=true and pin_hash is null;
  return found;
end $$;
create function public.change_manager_pin(expected_hash text, new_hash text) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.manager_security set pin_hash=new_hash,attempts=0,blocked_until=null,next_attempt_at=null where id=true and pin_hash=expected_hash;
  if not found then return false; end if;
  delete from public.manager_sessions;
  return true;
end $$;
create function public.install_plan(records jsonb) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  insert into public.template_runs(key) values('plan-90-v1') on conflict do nothing;
  if not found then return false; end if;
  insert into public.hub_records(id,entity,data)
    select (item->>'id')::uuid,item->>'entity',item->'data' from jsonb_array_elements(records) item;
  return true;
end $$;
create function public.save_work_item(record_id uuid, payload jsonb, next_payload jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare saved public.hub_records; previous_status text;
begin
  if record_id is null then
    insert into public.hub_records(entity,data) values('work-items',payload) returning * into saved;
  else
    select data->>'status' into previous_status from public.hub_records where id=record_id and entity='work-items' for update;
    if not found then raise exception 'Task not found'; end if;
    update public.hub_records set data=payload where id=record_id returning * into saved;
  end if;
  if payload->>'status'='selesai' and previous_status is distinct from 'selesai' and next_payload is not null then
    insert into public.hub_records(entity,data,recurrence_key) values('work-items',next_payload,saved.id::text || ':' || (payload->>'due_date')) on conflict(recurrence_key) do nothing;
  end if;
  return to_jsonb(saved);
end $$;
create function public.restore_manager_data(records jsonb, reports jsonb) returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.hub_records;
  insert into public.hub_records(id,entity,data,recurrence_key,created_at,updated_at)
    select (item->>'id')::uuid,item->>'entity',item->'data',item->>'recurrence_key',(item->>'created_at')::timestamptz,(item->>'updated_at')::timestamptz from jsonb_array_elements(records) item;
  delete from public.manager_reports;
  insert into public.manager_reports(id,title,period_start,period_end,snapshot,created_at)
    select (item->>'id')::uuid,item->>'title',(item->>'period_start')::date,(item->>'period_end')::date,item->'snapshot',(item->>'created_at')::timestamptz from jsonb_array_elements(reports) item;
  insert into public.template_runs(key) values('plan-90-v1') on conflict do nothing;
end $$;

alter table public.hub_records enable row level security;
alter table public.manager_security enable row level security;
alter table public.manager_sessions enable row level security;
alter table public.manager_reports enable row level security;
alter table public.activity_log enable row level security;
alter table public.template_runs enable row level security;
-- Tidak ada policy anon/authenticated. Hanya server dengan sesi terverifikasi.
revoke all on public.hub_records,public.manager_security,public.manager_sessions,public.manager_reports,public.activity_log,public.template_runs from anon,authenticated;
grant all on public.hub_records,public.manager_security,public.manager_sessions,public.manager_reports,public.activity_log,public.template_runs to service_role;
grant usage, select on sequence public.activity_log_id_seq to service_role;
revoke all on function public.reserve_pin_attempt(),public.finish_pin_login(text,text),public.initialize_manager(text),public.change_manager_pin(text,text),public.install_plan(jsonb),public.restore_manager_data(jsonb,jsonb),public.save_work_item(uuid,jsonb,jsonb),public.hub_changed(),public.hub_log(),public.hub_check_relations() from public,anon,authenticated;
grant execute on function public.reserve_pin_attempt(),public.finish_pin_login(text,text),public.initialize_manager(text),public.change_manager_pin(text,text),public.install_plan(jsonb),public.restore_manager_data(jsonb,jsonb),public.save_work_item(uuid,jsonb,jsonb) to service_role;
commit;
