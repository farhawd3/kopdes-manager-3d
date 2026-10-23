# Tampilan

Gaya yang berlaku sekarang (arahan pemilik 23 Oktober 2026) mengacu pada desain **TaskTrack** di Dribbble: cangkang putih bersih, kartu pastel penuh, label pil bergaris, progres bersegmen, avatar bertumpuk. Ini bukan aturan permanen. Mengganti tampilan cukup dengan mengubah token; komponen tidak boleh berisi warna mentah.

## Aturan tetap

- Semua warna di blok token `src/app/globals.css`. Komponen memakai kelas token: `bg-canvas`, `bg-surface`, `text-ink`, `text-ink-2`, `bg-accent`, `bg-action`, `bg-tone`, dan seterusnya.
- **Tanpa gradasi** di mana pun (pemilik: gradasi = AI slop). Warna solid dan lembut.
- Tidak ada `!important` kecuali pengaturan `prefers-reduced-motion` dan cetak.
- Satu `h1` per halaman (`PageHeader` atau kepala detail).
- Area sentuh minimal 44 px di HP; fokus keyboard selalu terlihat; status ditandai teks, bukan warna saja.
- Hormati `prefers-reduced-motion`.

## Token

| Kelompok | Token | Arti |
|---|---|---|
| Permukaan | `canvas`, `surface`, `surface-2`, `surface-3`, `line`, `line-strong` | latar, kartu, garis |
| Teks | `ink`, `ink-2`, `ink-3` | utama, kedua, keterangan (kontras ≥ 4.5:1) |
| Aksi | `action`, `action-hover`, `on-action` | tombol utama biru tua |
| Logo | `brand`, `on-brand` | hanya tanda Kopdes (ubin koral), tidak untuk tombol |
| Sorotan | `accent`, `accent-ink`, `accent-strong` | menu aktif, tab, hari terpilih, fokus; 5 pilihan pengguna |
| Status | `plan`, `doing`, `done`, `late`, `warn` (+ `-ink`) | rencana, dikerjakan, selesai, terlambat, perhatian |
| Nada kartu | `tone`, `tone-ink`, `tone-bar`, `tone-line` | dipasang lewat `data-tone="rose\|peach\|sky\|lavender\|mint\|lemon\|slate"` |

- Tema terang dan gelap: `data-theme` di `<html>`, pilihan tersimpan di `localStorage` (`kopdes-theme`, `kopdes-accent`), diterapkan sebelum halaman tampil.
- Warna kartu tugas dan proyek mengikuti **proyek** (`lib/tones.ts`, kolom `color` proyek). Kartu catatan lain mengikuti artinya: kas masuk mint, keluar mawar; stok habis mawar, menipis peach (`features/records/card-tone.ts`).
- Huruf: Urbanist (`@fontsource-variable/urbanist`), satu token `--font-sans`.

## Komponen

| Komponen | Berkas | Catatan |
|---|---|---|
| Laci / lembar bawah | `components/ui/sheet.tsx` | Semua formulir dan detail. Kanan di tablet/laptop, dari bawah di HP |
| Konfirmasi | `components/ui/confirm.tsx` | Satu-satunya dialog di tengah, hanya untuk tindakan yang tak bisa diurungkan |
| Toast + Urungkan | `sonner` di kerangka | Hasil aksi; perubahan tugas selalu bisa diurungkan |
| Tab bergeser | `components/ui/tabs.tsx` | Penanda aktif meluncur (Motion) |
| Ubin angka | `components/ui/stat.tsx` | Ringkasan pastel; catatan kecil menjelaskan arti angka |
| Kartu tugas | `features/tasks/task-card.tsx` | Label proyek, centang, progres bersegmen, avatar, tenggat |
| Hiasan | `components/ui/wave.tsx` | Satu-satunya hiasan kartu: lengkung tipis, sangat halus |
| Logo | `components/ui/logo.tsx`, `app/icon.svg` | Ubin koral dengan atap gerai dan centang; dipakai di sidebar dan halaman PIN |
| Kepala halaman | `components/layout/page-header.tsx` | Bilah putih: judul dan ringkasan di kiri, aksi di kanan. Beranda memakai bilah tanggal (bulan, hari ini, tim) |

## Kerangka

- Laptop (≥ 1024 px): sidebar 264 px dengan grup Kerja, Catatan, Usaha, Koperasi, lalu proyek aktif dan profil.
- Tablet (768–1023 px): rel ikon 84 px dengan label kecil.
- HP (< 768 px): bilah atas ringkas + navigasi bawah melayang. Item aktif mengembang menjadi kapsul pastel berlabel yang meluncur; tombol tambah bulat di tengah membuka menu tambah cepat.
- Bilah atas: sapaan dan nama manajer di kiri, cari (Ctrl K) di tengah, lonceng, tombol Tambah, avatar. Di HP: avatar + sapaan, ikon cari, lonceng.
- Menu aktif di sidebar: kapsul putih berbayang dengan ikon berwarna sorotan.

## Gerak

- Satu bahasa gerak: `ease-out` cepat (`--ease-out`), 0,2–0,45 detik.
- Yang bergerak: kartu masuk berurutan, penanda menu/tab meluncur, centang pop, kartu berpindah kolom, laci meluncur, konfeti kecil saat semua rutin selesai.
- Animasi dimuat lewat `LazyMotion` agar tidak memperbesar unduhan awal.

## Kata-kata di layar

Bahasa Indonesia sehari-hari, langsung, tidak terdengar terjemahan, tanpa slogan dan tanpa tanda seru berlebihan.

| Pakai | Hindari |
|---|---|
| Tambah, Simpan, Ubah, Hapus, Batal | Submit, Proceed, Konfirmasi Data Anda |
| Selesai, Dikerjakan, Rencana, Terlambat | Done, In progress, To-do |
| Tenggat, Hari ini, Besok, 3 hari lagi | Due date, Deadline |
| Urungkan | Undo, Batalkan aksi |
| Belum ada tugas. | Wah, belum ada tugas nih! |
| Data belum dapat dimuat | Terjadi kesalahan tak terduga |
