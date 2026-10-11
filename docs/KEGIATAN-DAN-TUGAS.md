# Kegiatan, tugas, dan Beranda manajer

Alur pengisian terbaru: [ALUR-PENGISIAN](ALUR-PENGISIAN.md). Form tugas mendahulukan proyek; tugas mandiri tetap tersedia dengan pilihan eksplisit. Progres tugas 100% tidak menutup proyek otomatis. Proyek selesai/arsip tersedia di Riwayat Proyek, termasuk tugas selesai lama.

**Tugas** (`/tugas`, entitas `work-items`) adalah pekerjaan yang harus ditindaklanjuti: ada penanggung jawab, tenggat, prioritas, status `rencana`/`proses`/`selesai`/`dibatalkan`, dan bisa terkait proyek, milestone, rapat, dokumen, serta mitra. Tugas muncul di daftar, papan, kalender, Gantt, Hari Ini, dan Perlu Perhatian. Perubahan status harus memakai satu aturan di seluruh tampilan.

**Kegiatan** (`/jurnal`, entitas `journal`) adalah catatan apa yang terjadi: kunjungan, koordinasi, pembahasan, hasil lapangan. Isinya tanggal, uraian, unit, serta tautan opsional ke tugas/mitra. Kegiatan tidak perlu status tugas atau tenggat. Jangan menampilkan jurnal sebagai tugas yang belum selesai. Bila dari kegiatan timbul pekerjaan, buat tugas terkait; bila tugas dikerjakan, catat hasil sebagai kegiatan yang menunjuk tugas itu. Rapat (`/rapat`) tetap catatan jadwal/acara tersendiri dengan tautan online bila diisi pengguna.

Contoh: “Mengunjungi koperasi Jumat” = tugas bila kunjungan belum dilakukan. Setelah kunjungan, “Bertemu pengurus; perlu daftar inventaris” = kegiatan yang terkait tugas kunjungan. “Minta daftar inventaris” = tugas lanjutan. Ini menghindari satu kejadian dicatat tiga kali sebagai tugas aktif.

## Arah desain

- Beranda dimulai dari **Perlu tindakan**: terlambat, tenggat hari ini, rapat berikutnya. Setiap item punya alasan dan tautan ke sumber.
- Di bawahnya tampil **Proyek berjalan** dan **Kegiatan terbaru**. Kegiatan adalah kronologi singkat, bukan angka capaian tiruan. Gunakan tombol jelas “Catat kegiatan” dan “Buat tugas”; jangan gabungkan keduanya dalam satu form ambigu.
- Kartu tugas menampilkan judul, tenggat, status, dan proyek; kode hanya metadata kecil. Kartu kegiatan menampilkan tanggal, ringkasan, dan relasi tugas/mitra bila ada. Grafik hanya memakai data yang lengkap atau menandai cakupan parsial.
- Ponsel: satu kolom dan urutan tindakan → jadwal → proyek → kronologi. Desktop boleh memakai dua kolom tanpa memutus urutan baca. Seluruh kartu membuka sumber aslinya.

Kriteria terima: pengguna dapat membuat kegiatan tanpa tenggat/status tugas; dapat membuat tugas dari tindak lanjut kegiatan dan menautkan keduanya; Beranda membedakan “yang perlu dikerjakan” dari “yang sudah terjadi”; perubahan tersimpan dan muncul pada halaman terkait tanpa duplikasi.
