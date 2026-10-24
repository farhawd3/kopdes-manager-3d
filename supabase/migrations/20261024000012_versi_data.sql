-- Migrasi 12: indeks waktu ubah untuk pemeriksa versi data (/api/version).
-- Jalankan di cloud hanya setelah disetujui pemilik pada proyek <project-ref>.
-- Aplikasi bertanya "ada perubahan?" setiap membuka halaman; kueri itu mengambil catatan dengan
-- updated_at terbaru. Indeks ini membuatnya tetap cepat walau catatan bertambah banyak.
-- Hanya menambah indeks: tidak mengubah tabel, data, fungsi, atau izin RLS. Aman diulang.
begin;

create index if not exists hub_records_updated_idx on public.hub_records (updated_at desc);

commit;
