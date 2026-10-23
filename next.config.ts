import type { NextConfig } from 'next';
const config: NextConfig = {
  // Mode demo memakai folder build sendiri agar bisa berjalan berdampingan dengan `npm run dev`.
  // NEXT_DIST_DIR untuk build pemeriksaan tanpa menyentuh folder server dev yang sedang berjalan.
  distDir: process.env.NEXT_DIST_DIR || (process.env.NEXT_PUBLIC_MODE_DEMO === '1' ? '.next-demo' : '.next'),
  devIndicators: false,
  agentRules: false,
  poweredByHeader: false,
  // Alamat lama (bahasa Indonesia) dialihkan ke alamat baru; parameter tautan ikut terbawa.
  async redirects() {
    const map: [string, string][] = [
      ['/beranda', '/home'],
      ['/hari-ini', '/home'],
      ['/tindak-lanjut', '/home'],
      ['/tugas', '/tasks'],
      ['/roadmap', '/tasks?view=timeline'],
      ['/proyek', '/projects'],
      ['/riwayat-proyek', '/projects?view=history'],
      ['/risiko', '/projects?tab=risks'],
      ['/rapat', '/agenda'],
      ['/jurnal', '/notes'],
      ['/laporan', '/notes?tab=reports'],
      ['/dokumen', '/documents'],
      ['/mitra', '/contacts'],
      ['/pemangku', '/contacts'],
      ['/gerai', '/store'],
      ['/kesiapan', '/store?tab=readiness'],
      ['/penjualan', '/store?tab=sales'],
      ['/barang', '/goods'],
      ['/stok-opname', '/goods?tab=counts'],
      ['/pengiriman', '/goods?tab=deliveries'],
      ['/pembelian', '/goods?tab=purchases'],
      ['/aset', '/assets'],
      ['/anggota', '/members'],
      ['/simpanan', '/members?tab=savings'],
      ['/keuangan', '/cash'],
      ['/pencatatan', '/cash'],
      ['/tim', '/team'],
      ['/absensi', '/team?tab=attendance'],
      ['/dunia-koperasi', '/world'],
      ['/pengaturan', '/settings'],
      ['/panduan', '/help'],
    ];
    return map.map(([source, destination]) => ({ source, destination, permanent: false }));
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
          },
        ],
      },
    ];
  },
};
export default config;
