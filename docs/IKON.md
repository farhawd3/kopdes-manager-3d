# Panduan ikon antarmuka

Gunakan SVG dari Lucide melalui `AppIcon` di `src/components/ui/AppIcon.tsx` untuk makna bersama. Tidak memakai emoji, font ikon atau gambar bitmap untuk kontrol. Ikon domain tetap sama di navigasi, judul, kartu, form dan panduan.

| Makna | Nama registry | Bentuk |
|---|---|---|
| Gerai | store | Store |
| Rapat | meeting | Video |
| Anggota | members | Users |
| Buku kas | cash | Wallet |
| Barang | inventory | Package |
| Stok opname | stockCount | ClipboardCheck |
| Panduan | guide | BookOpen |
| Profil | profile | Building2 |
| Proyek | project | FolderKanban |
| Hari ini | today | CalendarCheck |
| Laporan | report | FileText |
| Opsi | more | Ellipsis |
| Buka halaman | open | ArrowUpRight |
| Perlu perhatian | warning | AlertTriangle |
| Selesai/sesuai | complete | CircleCheck |
| Tidak tersedia/habis | unavailable | CircleX |
| Tutup/reset filter | close | X |

Ukuran: 16 px di metadata/kontrol padat, 18 px di aksi, 20 px di judul kartu, 24 px di pintu masuk domain. Garis 1,75 px, ujung membulat, warna `currentColor`; gunakan token tema untuk latar ikon. Area sentuh tombol tetap minimal 44 px, terpisah dari ukuran gambar ikon. SVG tidak boleh menyusut di flex.

Label tindakan/status selalu berupa teks. Ikon bersama teks bersifat dekoratif (`aria-hidden`); ikon mandiri diberi `label`, atau tombol induknya wajib mempunyai `aria-label`. Ikon dan warna tidak boleh menjadi satu-satunya petunjuk status. Hindari plus/check per karakter jika bentuk SVG tersedia.

Contoh: `<AppIcon name="cash" size={18} /> Buku kas`. Untuk tombol tanpa teks, gunakan `IconButton aria-label="Buka opsi"` dengan `AppIcon name="more"` di dalamnya.

Tambahkan makna baru ke registry hanya jika benar-benar berbeda; periksa bentuk Lucide yang sudah ada terlebih dahulu. Ikon khusus, bila diperlukan, berupa SVG 24×24 dengan stroke 1,75, tanpa warna hardcoded dan mengikuti kontrak aksesibilitas yang sama. Ikon Lucide lama pada fitur lain tetap sah; migrasikan ke registry saat fitur tersebut disentuh. Registry ini bukan klaim seluruh ikon aplikasi sudah dimigrasikan.
