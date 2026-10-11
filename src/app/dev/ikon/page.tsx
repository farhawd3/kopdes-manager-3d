import { notFound } from 'next/navigation';
import { IKON3D_KINDS, Ikon3D, THUMB_KINDS, ThumbBarang } from '@/components/ui/Ikon3D';
import { IKON_HALAMAN, IkonHalaman } from '@/components/ui/IkonHalaman';

/** Katalog ikon timbul dua warna dan thumbnail barang; development saja. */
export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound();
  const sel = (nama: string, isi: React.ReactNode) => (
    <li key={nama} style={{ display: 'grid', justifyItems: 'center', gap: 6, padding: 12, borderRadius: 16, background: '#fff', boxShadow: '0 6px 20px rgba(40,60,120,.08)' }}>
      {isi}
      <small style={{ fontSize: 12, color: '#64708a' }}>{nama}</small>
    </li>
  );
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, listStyle: 'none', padding: 0 } as const;
  return (
    <main style={{ padding: 24, background: '#f3f5fb', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Ikon timbul dua warna</h1>
      <ul style={grid}>{IKON3D_KINDS.map((k) => sel(k, <Ikon3D kind={k} size={88} />))}</ul>
      <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>Thumbnail barang</h2>
      <ul style={grid}>{THUMB_KINDS.map((k) => sel(k, <ThumbBarang kind={k} size={88} />))}</ul>
      <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>Menu samping (ubin 32 px)</h2>
      <ul style={{ ...grid, gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
        {Object.keys(IKON_HALAMAN).map((href) => (
          <li key={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: '#fff', borderRadius: 10 }}>
            <IkonHalaman href={href} size={32} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{href.slice(1)}</span>
          </li>
        ))}
      </ul>
      <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>Ukuran kecil</h2>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{IKON3D_KINDS.map((k) => <Ikon3D key={k} kind={k} size={24} />)}</div>
    </main>
  );
}
