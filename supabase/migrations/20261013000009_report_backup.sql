-- Migrasi 9: pertahankan status laporan saat menyimpan dan memulihkan cadangan.
begin;

-- Status snapshot dipakai UI; kolom status lama dapat tertinggal sebagai final.
update public.manager_reports
  set status = snapshot->>'status'
  where snapshot->>'status' in ('draft', 'final')
    and status is distinct from snapshot->>'status';

create or replace function public.restore_manager_data(records jsonb, reports jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.hub_records;
  insert into public.hub_records(id,entity,data,recurrence_key,created_at,updated_at)
    select (item->>'id')::uuid,item->>'entity',item->'data',item->>'recurrence_key',
      (item->>'created_at')::timestamptz,(item->>'updated_at')::timestamptz
    from jsonb_array_elements(records) item;
  delete from public.manager_reports;
  insert into public.manager_reports(id,title,period_start,period_end,snapshot,created_at,status)
    select (item->>'id')::uuid,item->>'title',(item->>'period_start')::date,
      (item->>'period_end')::date,
      jsonb_set(item->'snapshot','{status}',to_jsonb(coalesce(item->'snapshot'->>'status',item->>'status','final'))),
      (item->>'created_at')::timestamptz,
      coalesce(item->'snapshot'->>'status',item->>'status','final')
    from jsonb_array_elements(reports) item;
  insert into public.template_runs(key) values('plan-90-v1') on conflict do nothing;
end $$;

revoke all on function public.restore_manager_data(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.restore_manager_data(jsonb,jsonb) to service_role;

commit;
