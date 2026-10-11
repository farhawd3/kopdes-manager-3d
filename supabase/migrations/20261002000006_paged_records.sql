-- Indeks untuk daftar bertahap. Tidak mengubah atau menghapus catatan.
-- Target: proyek Kopdes saat ini, <project-ref>.
begin;
create index if not exists hub_records_page_created_idx
  on public.hub_records (entity, created_at desc, id desc);
create index if not exists hub_task_page_due_idx
  on public.hub_records ((data->>'due_date'), id desc)
  where entity = 'work-items';
create index if not exists hub_task_status_completed_idx
  on public.hub_records ((data->>'status'), (data->>'completed_at'))
  where entity = 'work-items';
create index if not exists hub_project_records_idx
  on public.hub_records (entity, (data->>'workstream_id'), created_at desc)
  where entity in ('work-items', 'milestones', 'checklist');
commit;
