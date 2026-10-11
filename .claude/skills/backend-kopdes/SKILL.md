---
name: backend-kopdes
description: Data dan backend Kopdes — hub_records, skema Zod/katalog, API, migrasi SQL Supabase, tes PGlite, kemampuan server. Pakai saat menambah domain, kolom, migrasi, atau aksi server.
---

# Backend Kopdes

Acuan: `AGENTS.md` (keamanan), `docs/ARSITEKTUR.md`, `docs/MIGRASI-SQL.md`, `docs/PENCATATAN.md`.

## Pola data
- Semua catatan di `hub_records(entity, data jsonb)`. Skema: `src/features/records/schemas.ts` (Zod `.strict()`); label/kolom/pilihan/relasi/halaman: `catalog.ts`.
- Kolom baru tanpa SQL: tambah ke skema (dengan default) + `catalog` fields/options/labels. Data lama tetap valid.
- Entitas baru butuh migrasi: daftar `hub_records_entity_check`, `hub_check_relations` untuk `*_id`, trigger validasi, fungsi `*_ready()` untuk pemeriksaan kemampuan.
- Penyimpanan lewat `service.save`; aksi yang harus atomik memakai fungsi SQL (contoh `hub_post_stock_movement`) yang hanya untuk `service_role`.
- Domain yang butuh migrasi: daftar di `operationEntities`/`logisticsEntities`, disaring di `useWorkspace`, keadaan "belum aktif" ditampilkan.

## Migrasi
- Berkas bernomor baru di `supabase/migrations/`; satu transaksi; tidak menghapus data.
- Tes PGlite memuat seluruh migrasi berurutan (contoh `tests/database/logistics.test.ts`).
- Bangun ulang: `node scripts/build-install.mjs`, `build-reset.mjs`, `build-force-reset.mjs`; jalankan `npx vitest run tests/database`.
- Cloud (`<project-ref>`): jelaskan berkas, dampak, proyek tujuan, minta persetujuan; pemilik yang menjalankan.

## Keamanan
- Setiap aksi: sesi + Zod + pemeriksaan asal; RLS aktif, akses anon/authenticated ditolak. Rahasia tidak ke browser/Git/log.
- Galat database → pesan Indonesia yang jelas, tidak menjadi angka nol.
