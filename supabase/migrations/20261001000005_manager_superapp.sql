-- Migrasi 5: Fitur Superapp Manajer & Manajemen Draf Laporan (KDMP Puntukrejo)
-- 1. Menambahkan kolom status ('draft' | 'final') pada tabel manager_reports.
-- 2. Menjamin dukungan penuh untuk penghapusan (DELETE) dan pembaruan (UPDATE) draf laporan.
-- 3. Menambahkan indeks pencarian cepat laporan berdasarkan status dan periode tanggal.
-- 4. Idempoten dan aman dijalankan; tidak ada data laporan lama yang hilang.

begin;

-- Tambah kolom status pada tabel manager_reports jika belum ada
alter table public.manager_reports
  add column if not exists status text not null default 'final';

-- Perbarui status dari snapshot jika sebelumnya sudah tersimpan di jsonb
update public.manager_reports
  set status = coalesce(snapshot->>'status', 'final')
  where status is null or status = 'final' and snapshot ? 'status';

-- Buat indeks pencarian cepat untuk penyaringan draf vs laporan resmi
create index if not exists manager_reports_status_created_idx
  on public.manager_reports (status, created_at desc);

create index if not exists manager_reports_period_idx
  on public.manager_reports (period_start, period_end);

-- Pastikan izin akses penuh diberikan kepada role service_role
grant all on public.manager_reports to service_role;

commit;
