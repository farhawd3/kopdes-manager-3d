# Alur kerja manajer

1. Masuk menggunakan PIN. Isi profil koperasi melalui Pengaturan jika belum lengkap.
2. Buat proyek dengan tujuan, PIC, prioritas, dan tanggal pilihan Anda. Tidak wajib memilih durasi tertentu.
3. Tambahkan tugas dari ruang proyek agar hubungan proyek terisi otomatis.
4. Gunakan Daftar untuk mengubah status cepat, Papan untuk alur kerja, Kalender untuk agenda, atau Gantt untuk jadwal lintas hari.
5. Pada Gantt, pilih rentang dan skala. Geser batang atau tarik ujung kanan lalu tinjau dan simpan. Keyboard atau form tanggal memberi cara alternatif.
6. Tulis catatan proyek memakai judul, daftar, checklist, dan kutipan. Tinjau hasil format lalu simpan.
7. Catat rapat, keputusan, risiko/isu dan bukti. Buat tugas tindak lanjut dari catatan rapat/isu.
8. Gunakan Hari Ini saat mulai bekerja. Perbarui status sesuai pelaksanaan nyata, bukan hanya untuk mengisi grafik.
9. Simpan snapshot laporan berkala dan unduh cadangan JSON. Pemulihan mengganti data; uji pada lingkungan terpisah dahulu.

## Status

Proyek: rencana, aktif, ditunda, selesai, diarsipkan. Status proyek ditentukan manajer; progres tugas dihitung otomatis dan tidak otomatis mengubah status proyek.

Tugas: rencana, proses, selesai, dibatalkan. Tanggal selesai dicatat saat penyelesaian. Tugas berulang menghasilkan penerus sekali, secara atomik. Prasyarat melingkar ditolak. Gantt memperingatkan benturan tanggal tetapi tidak menjadwalkan ulang seluruh tugas turunan.

## Siklus pengembangan

Baca STATUS → KEPUTUSAN → PRD → kode terkait. Terapkan perubahan dalam satu paket, uji domain/keamanan dan UI penting, jalankan lint/typecheck/build, perbarui dokumentasi, kemudian commit/push. Instruksi kredensial dan migrasi cloud tetap mengikuti SUPABASE.md dan dilakukan pemilik.
