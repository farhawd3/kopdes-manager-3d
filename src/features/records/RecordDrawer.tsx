'use client';
// Laci detail bersama untuk semua jenis catatan: Detail · Terkait · Riwayat. Desktop = panel
// samping kanan; ponsel = lembar bawah. Tidak menulis data; Ubah membuka Editor yang sama.
import Link from 'next/link';
import { useId, useState } from 'react';
import { ArrowUpRight, Lightbulb, PencilLine, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Ikon3D } from '@/components/ui/Ikon3D';
import { IKON_HALAMAN } from '@/components/ui/IkonHalaman';
import { LihatDiDunia } from '@/components/ui/LihatDiDunia';
import { formatChoiceLabel, pages } from './catalog';
import type { Entity, Item } from './schemas';
import type { Workspace } from '../workspace/useWorkspace';
import { recordHref } from '../workspace/workspace-navigation';
import { detailBaris, judulEntitas, saran, terkait } from './terkait';
import { formatDate } from '@/lib/date';

const books: Partial<Record<Entity, string>> = {
  members: '/anggota',
  'cash-entries': '/keuangan',
  'inventory-items': '/barang',
  'stock-counts': '/stok-opname',
};
/** Ikon halaman asal jenis catatan, agar laci senada dengan menu. */
export function ikonEntitas(entity: Entity) {
  const slug = books[entity] ?? `/${Object.keys(pages).find((s) => pages[s].includes(entity)) ?? ''}`;
  return IKON_HALAMAN[slug] ?? 'dokumen';
}
const waktu = (iso: string) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? `${formatDate(iso.slice(0, 10))} ${iso.slice(11, 16)}` : '—';
};

type Tab = 'detail' | 'terkait' | 'riwayat';

/** Kelompok catatan terkait yang bisa dibuka; dipakai laci catatan dan laci tugas. */
export function DaftarTerkait({
  entity,
  row,
  workspace,
  onNavigate,
}: {
  entity: Entity;
  row: Item;
  workspace: Workspace;
  onNavigate?: () => void;
}) {
  const kelompok = terkait(entity, row, workspace);
  if (!kelompok.length)
    return (
      <p className="record-drawer-kosong">
        Belum ada catatan lain yang terhubung. Isi kolom rujukan (mis. Barang, Gerai, Rapat) atau nama
        penanggung jawab dari Tim agar catatan saling terhubung.
      </p>
    );
  return (
    <>
      {kelompok.map((k) => (
        <section key={`${k.entity}-${k.arah}-${k.judul}`} className="record-kelompok">
          <h3>
            <Ikon3D kind={ikonEntitas(k.entity)} size={20} rapat />
            {k.judul}
            <span>{k.rows.length}</span>
          </h3>
          <ul>
            {k.rows.slice(0, 8).map((r) => (
              <li key={r.id}>
                <Link href={recordHref(k.entity, r)} onClick={onNavigate}>
                  <span>{String(r.data.title || 'Tanpa judul')}</span>
                  <small>
                    {[
                      r.data.status ? formatChoiceLabel(String(r.data.status)) : '',
                      r.data.date || r.data.due_date ? formatDate(String(r.data.date || r.data.due_date)) : '',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </small>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          {k.rows.length > 8 && <p className="record-drawer-kosong">+{k.rows.length - 8} catatan lain</p>}
        </section>
      ))}
    </>
  );
}

export function RecordDrawer({
  entity,
  row,
  workspace,
  onClose,
  onEdit,
}: {
  entity: Entity;
  row: Item;
  workspace: Workspace;
  onClose: () => void;
  onEdit?: () => void;
}) {
  const [tab, setTab] = useState<Tab>('detail');
  const id = useId();
  const detail = detailBaris(entity, row, workspace);
  const jumlahTerkait = terkait(entity, row, workspace).reduce((n, k) => n + k.rows.length, 0);
  const aksi = saran(entity, row, workspace);
  const status = row.data.status ? String(row.data.status) : '';
  const aktivitas = Array.isArray(row.data.activities)
    ? (row.data.activities as { id: string; user: string; text: string; created_at: string }[])
    : [];
  return (
    <Modal className="record-drawer" aria-labelledby={`${id}-judul`} onDismiss={onClose}>
      <header className="record-drawer-head">
        <span className="record-drawer-ikon" aria-hidden="true">
          <Ikon3D kind={ikonEntitas(entity)} size={34} rapat />
        </span>
        <div>
          <small>{judulEntitas(entity)}</small>
          <h2 id={`${id}-judul`}>{String(row.data.title || 'Tanpa judul')}</h2>
          {status && <span className="record-drawer-status">{formatChoiceLabel(status)}</span>}
        </div>
        <button type="button" className="record-drawer-tutup" aria-label="Tutup detail" onClick={onClose}>
          <X size={18} />
        </button>
      </header>

      <div className="record-drawer-aksi">
        {onEdit && (
          <Button variant="primary" onClick={onEdit}>
            <PencilLine size={16} /> Ubah
          </Button>
        )}
        <LihatDiDunia entity={entity} id={row.id} />
      </div>

      {aksi.length > 0 && (
        <section className="record-drawer-saran" aria-label="Saran langkah berikut">
          {aksi.map((s) => (
            <Link key={s.id} href={s.href} className="record-saran" onClick={onClose}>
              <Lightbulb size={16} aria-hidden="true" />
              <span>
                <strong>{s.label}</strong>
                <small>{s.alasan}</small>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ))}
        </section>
      )}

      <div className="record-drawer-tabs" role="tablist" aria-label="Bagian detail">
        {(
          [
            ['detail', 'Detail', detail.length],
            ['terkait', 'Terkait', jumlahTerkait],
            ['riwayat', 'Riwayat', aktivitas.length || undefined],
          ] as const
        ).map(([t, label, n]) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`${id}-${t}`}
            aria-selected={tab === t}
            aria-controls={`${id}-panel`}
            onClick={() => setTab(t)}
          >
            {label}
            {n ? <span>{n}</span> : null}
          </button>
        ))}
      </div>

      <div className="record-drawer-isi" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`}>
        {tab === 'detail' &&
          (detail.length ? (
            <dl className="record-dl">
              {detail.map((b) => (
                <div key={b.field}>
                  <dt>{b.label}</dt>
                  <dd>{b.nilai}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="record-drawer-kosong">Belum ada isian selain judul.</p>
          ))}
        {tab === 'terkait' && <DaftarTerkait entity={entity} row={row} workspace={workspace} onNavigate={onClose} />}
        {tab === 'riwayat' && (
          <ol className="record-riwayat">
            {aktivitas
              .slice()
              .reverse()
              .map((a) => (
                <li key={a.id}>
                  <strong>{a.user}</strong> {a.text}
                  <small>{waktu(a.created_at)}</small>
                </li>
              ))}
            <li>
              Terakhir diubah<small>{waktu(row.updated_at)}</small>
            </li>
            <li>
              Dibuat<small>{waktu(row.created_at)}</small>
            </li>
          </ol>
        )}
      </div>
    </Modal>
  );
}
