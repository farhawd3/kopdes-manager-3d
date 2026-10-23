// Kantor: baris atas empat ruang selebar 10, baris bawah tiga ruang selebar ±13,3 (hx = setengah
// lebar), sayap Ngopi & istirahat terpisah di ujung kanan lorong. x/z = pusat ruang (dunia).
// Setiap ruang punya ciri perabot sendiri (monitoring-room.ts).
export const BIDANG = {
  // Baris atas: pintu ke kawasan gerai ada di dinding belakang ruang karyawan.
  karyawan: { nama: 'Karyawan gerai', x: -20, z: -5.25, hx: 5, warna: '#f3dccf', href: '/store' },
  // Buku kas: hanya uang masuk/keluar tercatat, bukan saldo bank atau laba.
  kas: { nama: 'Kas & anggota', x: -10, z: -5.25, hx: 5, warna: '#cfe5e1', href: '/cash' },
  manajer: { nama: 'Ruang manajer', x: 0, z: -5.25, hx: 5, warna: '#e9dcc8', href: '/documents' },
  gym: { nama: 'Gym & kegiatan', x: 10, z: -5.25, hx: 5, warna: '#cde6d9', href: '/notes' },
  // Baris bawah: stok di sudut kiri bawah dekat pintu gudang.
  stok: { nama: 'Stok & barang', x: -25 + 20 / 3, z: 5.25, hx: 20 / 3, warna: '#efe0c7', href: '/goods' },
  rapat: { nama: 'Rapat', x: -5, z: 5.25, hx: 20 / 3, warna: '#d6d1ef', href: '/agenda' },
  // Ruang kerja paling lebar: enam meja dan papan kanban.
  kerja: { nama: 'Ruang kerja', x: 15 - 20 / 3, z: 5.25, hx: 20 / 3, warna: '#c9d6ef', href: '/tasks' },
  // Sayap terpisah di ujung kanan lorong (x 15…25), selebar dua baris.
  istirahat: { nama: 'Ngopi & istirahat', x: 20, z: 0, hx: 5, warna: '#f1dcc4', href: '/team' },
} as const;
export type Bidang = keyof typeof BIDANG;
export type LokasiMonitoring = 'pulau' | 'gerai' | 'kantor' | 'gudang' | 'pendingin';
