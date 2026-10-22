import type { Metadata } from 'next';
import '@fontsource-variable/figtree';
import './globals.css';
import '../styles/token.css';
import '../styles/dasar.css';
import '../styles/komponen.css';
import '../styles/kerangka.css';
import '../styles/halaman.css';
export const metadata: Metadata = {
  title: 'Dunia Koperasi · Ruang kerja',
  description: 'Ruang kerja pribadi manajer koperasi: rencana, koordinasi, kesiapan, dan laporan.',
};
// Dibaca sebelum render agar tema dan aksen tidak berkedip. Nilai tak dikenal jatuh ke bawaan.
const skripTampilan = `(function(){try{var a=localStorage.getItem('hub-aksen')||'ungu';if(['ungu','biru','hijau','oranye','magenta'].indexOf(a)<0)a='ungu';document.documentElement.setAttribute('data-aksen',a);var t=localStorage.getItem('hub-theme')==='dark'?'dark':'light';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute('data-aksen','ungu');}})();`;
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skripTampilan }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
