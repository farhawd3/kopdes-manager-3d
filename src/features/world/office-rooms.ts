// Kantor: baris atas empat ruang selebar 10, baris bawah tiga ruang selebar ±13,3 (hx = setengah
// lebar), sayap Ngopi & istirahat terpisah di ujung kanan lorong. x/z = pusat ruang (dunia).
// Setiap ruang punya ciri perabot sendiri (monitoring-room.ts).
export const OFFICE_ROOMS = {
  // Baris atas: pintu ke kawasan gerai ada di dinding belakang ruang karyawan.
  karyawan: { name: 'Karyawan gerai', x: -20, z: -5.25, hx: 5, color: '#f3dccf', href: '/store' },
  // Buku kas: hanya uang masuk/keluar tercatat, bukan saldo bank atau laba.
  kas: { name: 'Kas & anggota', x: -10, z: -5.25, hx: 5, color: '#cfe5e1', href: '/cash' },
  manajer: { name: 'Ruang manajer', x: 0, z: -5.25, hx: 5, color: '#e9dcc8', href: '/documents' },
  gym: { name: 'Gym & kegiatan', x: 10, z: -5.25, hx: 5, color: '#cde6d9', href: '/notes' },
  // Baris bawah: stok di sudut kiri bawah dekat pintu gudang.
  stok: {
    name: 'Stok & barang',
    x: -25 + 20 / 3,
    z: 5.25,
    hx: 20 / 3,
    color: '#efe0c7',
    href: '/goods',
  },
  rapat: { name: 'Rapat', x: -5, z: 5.25, hx: 20 / 3, color: '#d6d1ef', href: '/agenda' },
  // Ruang kerja paling lebar: enam meja dan papan kanban.
  kerja: {
    name: 'Ruang kerja',
    x: 15 - 20 / 3,
    z: 5.25,
    hx: 20 / 3,
    color: '#c9d6ef',
    href: '/tasks',
  },
  // Sayap terpisah di ujung kanan lorong (x 15…25), selebar dua baris.
  istirahat: { name: 'Ngopi & istirahat', x: 20, z: 0, hx: 5, color: '#f1dcc4', href: '/team' },
} as const;
export type OfficeRoom = keyof typeof OFFICE_ROOMS;
export type WorldSite = 'pulau' | 'gerai' | 'kantor' | 'gudang' | 'pendingin';
