# Rencana Redesain Web — Keluar dari Desain Lama

Tanggal: 20 Oktober 2026
Status: **Disetujui pemilik (20 Oktober 2026) — Arah: Lantai Dunia.** Implementasi berjalan bertahap dari Paket 0 (lepas kunci), Paket 1 (token & kerangka), Paket 2 (komponen), hingga Paket 3 (Beranda POC).

Arahan pemilik: "Desain selalu relatif sama dari awal. Setiap redesain mempertahankan desain kuno ini. Warna tidak menarik dan tidak membuat website unik. Buat perencanaan agar desain lebih unik, fresh, dan punya ciri khas sendiri." (Disetujui untuk dieksekusi: "lakukan").

---

## 1. Kenapa desain selalu kembali ke bentuk yang sama

Setiap redesain hanya mengganti **cat**, tidak pernah **bentuk**:

| Putaran | Yang berubah | Yang tetap |
|---|---|---|
| Taskflow biru | warna aksen | sidebar kiri, kartu putih, ubin ikon, pil |
| Cerah | warna aksen | sama |
| Merah Putih (19 Okt) | warna aksen | sama |
| Lavender Lekuk (20 Okt) | warna aksen + takik pojok | sama |

Penguncinya:

1. **Aturan menulis ulang kerangka yang sama.** `AGENTS.md`, `DESIGN.md`, `PRODUCT.md`, skill `ui-ux-kopdes`, dan memori AI sama-sama mewajibkan: sidebar kiri 248 px, kartu putih datar di atas latar pucat, satu aksen, ubin ikon pastel, tombol pil, grid `.modul` bertinggi rata, "bersih dan tenang". Setiap AI membaca aturan ini lebih dulu, jadi hasilnya selalu bentuk yang sama dengan warna baru.
2. **Putaran prototipe menawarkan pilihan palet, bukan pilihan dunia.** Senja, Kebun, dan Teal adalah variasi warna di atas kerangka yang sama.
3. **CSS halaman (sekitar 230 KB di `src/styles/halaman/`) dibangun di atas kartu dan modul.** Mengganti `token.css` selalu menjadi jalan termurah, jadi redesain berhenti di situ.
4. **Huruf Plus Jakarta Sans** termasuk huruf yang paling sering dipakai desain buatan AI. Dengan huruf ini, tampilan langsung terasa seperti templat.
5. **Ciri khas terkuat produk tidak dipakai di web.** Dunia Koperasi 3D (lantai kayu, ruang berwarna, pin, diorama) punya gaya sendiri, sedangkan web tidak mengambil apa pun darinya. Di `kerangka.css` sudah ada token lantai per ruang (`--lantai-kerja`, `--lantai-buku`, `--lantai-gerai`, …), tetapi semuanya diisi `var(--canvas)`, warna latar yang sama.

**Kesimpulan:** selama aturan tertulis masih menggambarkan kerangka lama, redesain apa pun akan ditarik kembali ke sana. Langkah pertama adalah melepas kuncinya, baru kemudian mengganti tampilan.

---

## 2. Bagaimana arah dipilih

- Mode halaman: **Operate**. Manajer datang untuk menyelesaikan pekerjaan, jadi navigasi, tombol, isian, dan tabel tetap kontrol standar yang sudah dikenal. Dunia visual hanya menyumbang empat hal: **huruf, palet, kepadatan, dan satu gerakan khas.**
- Kandidat diambil dari dunia sehari-hari pengguna (koperasi desa di Indonesia), bukan dari alat kerja. Tujuh kandidat, diurutkan menurut kedekatannya dengan pengguna:
  1. Peta wilayah desa yang dicat di dinding balai desa
  2. Nota rangkap dan stempel koperasi
  3. Kalender dinding toko (angka besar, tanggal merah, pasaran)
  4. Diorama Dunia Koperasi milik produk ini sendiri
  5. Karung dan kemasan sembako (cetak stensil, warna kemasan)
  6. Buku tabungan (baris cetak dot-matrix)
  7. Tenun ikat (geometri sebagai grid)
- Undian `impeccable concept-seed` (kunci `bc1fd251`, mode operate) menetapkan **kandidat 4**. Undian dipakai agar pilihan tidak selalu jatuh ke arah yang paling umum. Enam penantang dari katalog ditimbang dengan dua ukuran: apakah pengguna mengenali dunianya, dan apakah produknya tetap jelas.

---

## 3. Arah utama: **Lantai Dunia**

> Setiap halaman adalah satu ruang di kantor koperasi; warna lantainya memberi tahu di mana Anda berada.

### Dunia visual
- **Rel navigasi biru batu** `#2F3B63`, seperti dinding diorama. Setiap menu memakai swatch warna lantai ruangnya.
- **Latar halaman memakai warna lantai ruang**, penuh, bukan semburat tipis:

  | Hub | Ruang di dunia | Lantai |
  |---|---|---|
  | Kerja (Beranda, Tugas, Hari ini) | Ruang kerja | pandan `#DCE8D6` |
  | Koperasi (kas, anggota, barang) | Kas & anggota, Stok | kayu madu `#F1DDBB` |
  | Agenda, Rapat | Rapat | lila `#E3DDF3` |
  | Usaha, Gerai | Gerai | persik `#F8DCC8` |
  | Dunia | Pulau | air `#D6EAEE` |

- **Permukaan modul** putih hangat `#FFFCF6`, tinta `#23263A`.
- **Aksen jingga kayu** `#C8680F`, diambil dari tepi lantai diorama. Dipakai untuk tombol utama, menu aktif, dan pilihan. Kontras teks putih di atasnya diuji ulang saat implementasi.
- **Satu identitas untuk web dan dunia.** Pin dan garis pilihan di dunia 3D (sekarang biru `#546FFF`) dipindah ke aksen jingga kayu, sekalian menjadi "paket warna dunia" yang memang sudah tertunda.

### Gerakan khas: **lempeng**
- Setiap modul tampil seperti lempeng lantai diorama: sudut lembut dan **tepi tebal 6 px** di bawahnya, dengan warna lantai ruang yang lebih gelap.
- Menu aktif juga "terangkat" dengan tepi yang sama.
- Tepi lempeng **hanya** dipakai untuk modul dan menu aktif. Tombol, isian, dan cip tetap datar.
- Kepala halaman memuat miniatur isometrik ruang yang sedang dibuka, ditambah tautan **Masuk ke ruang ini** menuju titik itu di Dunia Koperasi.
- Saat berpindah hub, warna latar beralih singkat. Transisi ini dimatikan bila pengguna memilih gerak dikurangi.

### Peningkatan yang dipinjam dari penantang yang kalah
- **Dari peta panduan taman:** warna wilayah memenuhi seluruh latar, tidak hanya dipakai sebagai aksen.
- **Dari halaman edisi beranotasi:** setiap status punya bentuk sendiri (isi penuh = selesai, garis = berjalan, coret = batal), tidak hanya warna, dan tetap bertuliskan.
- **Dari Ikeda *datamatics*:** semua angka (nominal kas, stok, jam) memakai satu suara tabular yang rapat.
- **Dari Labanotation:** di Agenda dan Linimasa, panjang blok sama dengan durasi sebenarnya, bukan kartu bertinggi tetap.
- **Dari spesimen bitmap Emigre:** skala huruf ketat lima langkah, dengan angka besar untuk hitungan "hari ini".
- **Dari umpan vertikal:** di ponsel, hal berikutnya (rutin atau tugas) selalu bisa dicapai dengan satu ketukan.

### Huruf
- Plus Jakarta Sans diganti. Judul memakai huruf yang berkarakter, isi tetap huruf kerja yang mudah dibaca, dan angka selalu `tabular-nums`.
- Kandidat diuji saat implementasi dengan teks nyata di ponsel: Bricolage Grotesque, Gantari, dan beberapa lainnya. Huruf dipasang lokal lewat `@fontsource`, tanpa unduhan saat build.

### Tampilan pertama (Beranda, desktop)
Rel biru batu di kiri dengan swatch lantai. Latar halaman pandan. Kepala halaman berisi sapaan, ringkasan satu baris, dan miniatur Ruang kerja dengan tautan **Masuk ke ruang ini**. Di bawahnya tambah cepat, lalu lempeng Rutin, Agenda, Perlu tindakan, dan Minggu ini. Tombol utama berwarna jingga kayu dan diletakkan di kepala halaman.

### Risiko
Bisa jatuh menjadi "tema mainan" bila tepi lempeng dipakai di semua elemen. Aturannya: tepi hanya untuk modul dan menu aktif, dan kontrol tetap standar.

---

## 4. Alternatif

### Peta Desa (kandidat teratas dari daftar sendiri)
> Ruang kerja dibaca seperti peta wilayah desa yang dicat di dinding balai desa.

- Palet: dinding kapur `#F4F1E8`, sawah `#7FB24A`, pemukiman `#F2C641`, sungai `#3E8ED0`, jalan bata `#C4472D`, garis batas `#1E1E1E`.
- Gerakan khas: Beranda dibuka dengan peta kecil wilayah kerja (Tugas, Agenda, Usaha, Koperasi) berisi penanda jumlah dan legenda bernomor. Batas antarwilayah digambar putus-putus.
- Risiko: metafora peta kuat di halaman ringkasan tetapi melemah di tabel padat. Merah bata juga dekat dengan merah yang pernah ditolak. Ini juga jenis arah yang sering menjadi pilihan umum.

### Standar kategori (pintu keluar)
Ruang kerja ala Notion/Linear: putih, abu, satu aksen, dikerjakan sangat rapi. **Tidak direkomendasikan**, karena pada dasarnya inilah keadaan sekarang. Bila dipilih, pemilik menyebut dua atau tiga produk acuan dan kualitas produk itu menjadi patokan.

### Penantang yang ditolak
| Penantang | Alasan ditolak | Yang tetap diambil |
|---|---|---|
| Data Sublim (Ikeda) | terlalu dingin, pengguna tidak mengenalinya | satu suara angka tabular |
| Rel Tengah Bertinta | terlalu akademis, merah rubrik | status berbentuk |
| Peta Kebun Binatang | lobus organik melawan tabel dan formulir | warna wilayah memenuhi latar |
| Spesimen Bitmap | retro, sulit dibaca di ponsel | skala huruf lima langkah |
| Partitur Gerak | membaca waktu ke atas membingungkan | blok agenda = durasi |
| Umpan Vertikal | menyembunyikan gambaran kerja | hal berikutnya satu ketukan |

Bila tidak ada yang cocok, bisa **undi ulang**: biasa, "lebih aman", atau "lebih berani".

---

## 5. Rencana kerja setelah arah dipilih

Setiap paket dikerjakan di cabang sendiri (`tampilan/<topik>`) dan diverifikasi sesuai AGENTS.md (tes, typecheck, lint, lint:ui, build, ukur:bundel, audit tampilan 375/768/1024/1440).

### Paket 0 — Lepaskan kunci (dokumen saja)
- Tulis ulang bagian gaya di `AGENTS.md`, `PRODUCT.md` (Brand Commitments), skill `ui-ux-kopdes`, dan memori AI. Isinya menunjuk ke arah baru, bukan ke kartu putih dan aksen tunggal.
- Tandai `DESIGN.md` lama sebagai usang. `DESIGN.md` baru ditulis **setelah** dunia baru dibangun, dari hasil nyata, bukan sebelumnya.
- Catat di dokumen bahwa yang dipilih adalah **dunia**, bukan palet, supaya putaran berikutnya tidak kembali ke tawar-menawar warna.

### Paket 1 — Token dan kerangka
- `token.css`: palet baru, token lantai per ruang benar-benar diisi, aksen, status berbentuk, dan mode gelap yang dirancang ulang dari arah ini (bukan sekadar dibalik).
- `kerangka.css` dan `navigasi.ts`: rel navigasi, swatch lantai, menu aktif terangkat, dan `data-ruang` yang menentukan latar halaman.
- Huruf baru.
- Perbarui tes `token-warna` (kontras teks di kedua tema).

### Paket 2 — Komponen
- Komponen lempeng (pengganti `.modul` dan `.bertakik`), status berbentuk, cip, dan angka tabular.
- Takik Lekuk dihapus bila tidak cocok dengan arah baru.

### Paket 3 — Beranda sebagai bukti
- Beranda dibangun penuh di arah baru, termasuk miniatur ruang dan tautan ke dunia.
- Audit tampilan di 375/768/1024/1440 px, terang dan gelap, lalu pemilik menilai sebelum lanjut.

### Paket 4 — Halaman lain per hub
- Kerja (Tugas, Hari ini, Linimasa), Agenda (blok = durasi), Koperasi, Usaha, Catatan, Pengaturan, dan laci/dialog.
- CSS yang tidak terpakai lagi dibuang per hub.

### Paket 5 — Dunia 3D disamakan
- `monitoring.css` dan warna pin/pilihan di Three.js beralih ke aksen yang sama, sehingga web dan dunia memakai satu identitas.

### Paket 6 — Penutup
- `DESIGN.md` baru ditulis dari hasil yang sudah dibangun. `CHANGELOG.md`, `docs/STATUS.md`, dan `docs/LANJUTAN-AI.md` diperbarui.

---

## 6. Yang tidak berubah

- Fungsi, data, rute, dan teks operasional.
- Kontrol standar: tombol, isian, tab, tabel, dan laci tetap bentuk yang dikenal.
- Aksesibilitas: area sentuh ≥ 44 px, fokus terlihat, status bertuliskan, gerak dikurangi, safe area.
- Prinsip produk: tanpa data karangan, buku kas hanya uang masuk/keluar, dan tampilan sama kuat di HP dan laptop.

## 7. Keputusan yang ditunggu dari pemilik

1. Arah: **Lantai Dunia**, **Peta Desa**, standar kategori, atau undi ulang (biasa, lebih aman, lebih berani).
2. Apakah aksen dunia 3D boleh ikut diganti, supaya web dan dunia satu identitas.
3. Apakah mode gelap tetap wajib di tahap pertama, atau menyusul setelah Beranda disetujui.
