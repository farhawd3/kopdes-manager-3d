import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Ikon3D } from '@/components/ui/Ikon3D';

export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <AppShell>
    <header className="page-heading">
      <h1>Ruang kerja koperasi</h1>
      <p>Pratinjau tampilan · Semua isi di bawah adalah contoh lokal.</p>
      <Link href="/dev/dunia-3d?contoh=1" className="workspace-preview-link">
        <Ikon3D kind="kantor" size={44} /> Buka pratinjau dunia 3D
      </Link>
    </header>
    <div className="workspace-preview-grid">
      <Card>
        <CardHeader><Ikon3D kind="papan" size={44} /><h2>Pekerjaan hari ini</h2></CardHeader>
        <Badge tone="info">Contoh · Dikerjakan</Badge>
        <h3>Menyiapkan ruang kerja gerai</h3>
        <p>Tugas, proyek, dan jadwal memiliki tempat yang sama di web dan dunia 3D.</p>
        <Link href="/tugas" className="workspace-preview-link">Buka tugas</Link>
      </Card>
      <Card>
        <CardHeader><Ikon3D kind="kotak" size={44} /><h2>Barang & stok</h2></CardHeader>
        <Badge tone="warn">Contoh · Perlu diperiksa</Badge>
        <h3>Catatan stok koperasi</h3>
        <p>Stok buku dan hasil hitung fisik tetap terpisah. Jumlah mengikuti catatan asli.</p>
        <Link href="/barang" className="workspace-preview-link">Buka barang & stok</Link>
      </Card>
      <Card>
        <CardHeader><Ikon3D kind="kalender" size={44} /><h2>Rapat & kegiatan</h2></CardHeader>
        <Badge tone="success">Contoh · Terjadwal</Badge>
        <h3>Koordinasi pengelola</h3>
        <p>Agenda, keputusan, dan tindak lanjut dapat dibuka dari ruang rapat.</p>
        <Link href="/rapat" className="workspace-preview-link">Buka rapat</Link>
      </Card>
    </div>
    <Card>
      <CardHeader><Ikon3D kind="dokumen" size={44} /><h2>Tulisan dan form</h2></CardHeader>
      <Field label="Judul catatan contoh" id="preview-title" helper="Pratinjau ini tidak menyimpan data.">
        <Input id="preview-title" aria-describedby="preview-title-helper" defaultValue="Persiapan gerai koperasi" />
      </Field>
    </Card>
  </AppShell>;
}
