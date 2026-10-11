import type { NextConfig } from 'next';
const config: NextConfig = {
  // Mode demo memakai folder build sendiri agar bisa berjalan berdampingan dengan `npm run dev`.
  // NEXT_DIST_DIR untuk build pemeriksaan tanpa menyentuh folder server dev yang sedang berjalan.
  distDir: process.env.NEXT_DIST_DIR || (process.env.NEXT_PUBLIC_MODE_DEMO === '1' ? '.next-demo' : '.next'),
  devIndicators: false,
  agentRules: false,
  poweredByHeader: false,
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
