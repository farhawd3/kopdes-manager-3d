'use client';
import Link from 'next/link';
import * as motion from 'motion/react-m';
import {
  CalendarClock,
  Download,
  ExternalLink,
  Globe2,
  ListPlus,
  MessageCircle,
  NotebookPen,
  Pencil,
  Phone,
  Trash2,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Entity, Item } from './schemas';
import type { Workspace } from '@/features/workspace/use-workspace';
import { cardTone, riskLevel, riskScore, stockState } from './card-tone';
import { detailRows, displayValue, entityTitle, relatedGroups, suggestions, summaryChips } from './related';
import { formatChoiceLabel } from './catalog';
import { MEETING_KINDS, meetingKindOf, recordOutcomeHref } from '@/features/agenda/meeting-kinds';
import { downloadMeeting, meetingJoinUrl } from '@/features/agenda/meeting';
import { hasWorldPlace, worldHref } from '@/features/world/world-link';
import { recordLink } from '@/components/layout/nav';
import { Wave } from '@/components/ui/wave';
import { Pill, statusTone } from '@/components/ui/pill';
import { AvatarStack } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { useConfirm } from '@/components/ui/confirm';
import { api } from '@/lib/client';
import { addDays, daysBetween, formatDate, today } from '@/lib/date';
import { cn } from '@/lib/utils';

const LONG_FIELDS = ['description', 'notes', 'agenda', 'minutes', 'mitigation', 'items', 'reason', 'evidence', 'follow_up', 'goal'];
const UNDELETABLE: Entity[] = ['organization', 'workstreams', 'stock-movements'];

const people = (entity: Entity, row: Item): string[] => {
  const d = row.data;
  if (entity === 'meetings') return String(d.participants || '').split(/[,;\n]/).map((n) => n.trim()).filter(Boolean);
  return [String(d.assignee || '')].filter(Boolean);
};

/** Nomor HP menjadi tautan WhatsApp (0 → 62) dan telepon bila panjangnya masuk akal. */
function phoneLinks(contact: string) {
  const digits = contact.replace(/\D/g, '');
  if (digits.length < 8) return null;
  return { wa: `https://wa.me/${digits.replace(/^0/, '62')}`, tel: `tel:${digits}` };
}

/** Baris penting per jenis catatan, ditampilkan di kartu dan laci. */
function keyFacts(entity: Entity, row: Item, ws: Workspace): string[] {
  const d = row.data;
  const date = today();
  switch (entity) {
    case 'meetings': {
      const place = d.mode === 'online' ? 'Rapat online' : String(d.location || 'Tatap muka');
      return [`${formatDate(String(d.date))} · ${String(d.time || '')} WIB`, place];
    }
    case 'documents': {
      const expiry = String(d.expires_date || '');
      if (!expiry) return ['Masa berlaku tetap'];
      if (expiry < date) return [`Kedaluwarsa ${formatDate(expiry)}`];
      if (expiry <= addDays(date, 30)) return [`Berakhir ${formatDate(expiry)} (≤30 hari)`];
      return [`Berlaku s.d. ${formatDate(expiry)}`];
    }
    case 'risks': {
      const score = riskScore(row);
      return [`Skor ${score} · ${riskLevel(score)}`];
    }
    case 'stakeholders': {
      const last = String(d.last_contact || '');
      const facts = [String(d.contact || '')].filter(Boolean);
      if (last && daysBetween(last, date) > 14) facts.push('Perlu dihubungi (>14 hari)');
      const count = (ws.interactions || []).filter((i) => i.data.stakeholder_id === row.id).length;
      if (count) facts.push(`${count} interaksi`);
      return facts;
    }
    case 'inventory-items': {
      const state = stockState(row);
      return [`Stok ${Number(d.book_quantity || 0)} ${String(d.measurement || '')} · ${state === 'aman' ? 'Aman' : state === 'menipis' ? 'Menipis' : 'Habis'}`];
    }
    case 'cash-entries':
      return [`${d.direction === 'masuk' ? '+' : '−'} ${displayValue(entity, 'amount', d.amount, ws)}`, formatDate(String(d.date))];
    case 'stock-counts': {
      const diff = Number(d.counted_quantity) - Number(d.book_quantity);
      return [diff === 0 ? 'Fisik sesuai' : diff < 0 ? `Kurang ${-diff}` : `Lebih ${diff}`, `Buku ${Number(d.book_quantity)} · Fisik ${Number(d.counted_quantity)}`];
    }
    default:
      return [];
  }
}

function statusOf(entity: Entity, row: Item): string {
  if (entity === 'meetings') return MEETING_KINDS[meetingKindOf(row)].label;
  if (entity === 'cash-entries') return row.data.direction === 'masuk' ? 'Uang masuk' : 'Uang keluar';
  const status = row.data.status ?? row.data.condition;
  return status ? formatChoiceLabel(String(status), `${entity}.status`) : '';
}

/** Kartu catatan pastel ala TaskTrack: label, judul, fakta penting, orang, dan tanggal. */
export function RecordCard({ entity, row, ws, onOpen, index = 0 }: { entity: Entity; row: Item; ws: Workspace; onOpen: () => void; index?: number }) {
  const chips = summaryChips(entity, row, ws).slice(0, 2);
  const facts = keyFacts(entity, row, ws);
  const status = statusOf(entity, row);
  return (
    <motion.article
      layout
      style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}
      data-tone={cardTone(entity, row, ws)}
      className="enter group relative flex min-h-36 cursor-pointer flex-col gap-3 overflow-hidden rounded-[var(--radius-card)] bg-tone p-4 text-tone-ink transition-shadow hover:shadow-card"
      onClick={onOpen}
    >
      <Wave />
      <div className="relative flex flex-wrap items-center gap-1.5">
        {status && <span className="rounded-full bg-surface/70 px-2.5 py-1 text-[11px] font-bold">{status}</span>}
        {chips.map((chip) => (
          <span key={chip} className="max-w-[12rem] truncate rounded-full border border-tone-line px-2.5 py-0.5 text-[11px] font-semibold">
            {chip}
          </span>
        ))}
      </div>
      <button type="button" className="relative text-left text-[16px] leading-snug font-bold text-ink outline-none after:absolute after:-inset-2" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
        {String(row.data.title || entityTitle(entity))}
      </button>
      {facts.length > 0 && (
        <ul className="relative flex flex-col gap-0.5 text-[13px] font-semibold opacity-90">
          {facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      )}
      <div className="relative mt-auto flex items-center justify-between gap-2">
        <AvatarStack names={people(entity, row)} />
        <span className="ml-auto text-xs font-semibold opacity-75">{formatDate(String(row.data.date || row.data.due_date || row.updated_at || ''))}</span>
      </div>
    </motion.article>
  );
}

/** Aksi khusus per jenis catatan (agenda, kontak, kegiatan, kendala). */
function EntityActions({ entity, row }: { entity: Entity; row: Item }) {
  const d = row.data;
  const actions: React.ReactNode[] = [];
  if (entity === 'meetings') {
    const join = meetingJoinUrl(row);
    if (join)
      actions.push(
        <Button key="join" asChild size="sm" variant="primary">
          <a href={join} target="_blank" rel="noreferrer"><Video />Gabung rapat</a>
        </Button>,
      );
    actions.push(<Button key="ics" size="sm" onClick={() => downloadMeeting(row)}><Download />Unduh jadwal (.ics)</Button>);
    if (String(d.date) <= today())
      actions.push(<Button key="outcome" asChild size="sm"><Link href={recordOutcomeHref(row, today())}><NotebookPen />Catat hasil</Link></Button>);
  }
  if (['meetings', 'journal', 'issues'].includes(entity)) {
    const params = new URLSearchParams({ new: '1', 'fill.title': `Tindak lanjut: ${String(d.title)}`, 'fill.notes': `Sumber ${entityTitle(entity).toLowerCase()}: ${String(d.title)}` });
    if (entity === 'meetings') params.set('fill.meeting_id', row.id);
    if (entity === 'issues') params.set('fill.issue_id', row.id);
    actions.push(<Button key="follow" asChild size="sm"><Link href={`/tasks?${params}`}><ListPlus />Tindak lanjut</Link></Button>);
  }
  if (entity === 'stakeholders') {
    const links = phoneLinks(String(d.contact || ''));
    if (links)
      actions.push(
        <Button key="wa" asChild size="sm"><a href={links.wa} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a></Button>,
        <Button key="tel" asChild size="sm"><a href={links.tel}><Phone />Telepon</a></Button>,
      );
  }
  if (d.link && /^https?:\/\//.test(String(d.link)))
    actions.push(<Button key="link" asChild size="sm"><a href={String(d.link)} target="_blank" rel="noreferrer"><ExternalLink />Buka tautan</a></Button>);
  if (hasWorldPlace(entity))
    actions.push(<Button key="world" asChild size="sm"><Link href={worldHref(entity, row.id)}><Globe2 />Lihat di dunia</Link></Button>);
  return actions.length ? <div className="flex flex-wrap gap-2">{actions}</div> : null;
}

/** Laci detail catatan: ringkasan, rincian, catatan terkait, saran, dan riwayat. */
export function RecordDetailSheet({
  entity,
  row,
  ws,
  open,
  onClose,
  onEdit,
  refresh,
}: {
  entity: Entity;
  row?: Item;
  ws: Workspace;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  refresh: () => Promise<void> | void;
}) {
  const confirm = useConfirm();
  if (!row) return null;
  const details = detailRows(entity, row, ws).filter((detail) => !LONG_FIELDS.includes(detail.field));
  const longText = LONG_FIELDS.filter((field) => String(row.data[field] || '').trim());
  const groups = relatedGroups(entity, row, ws);
  const ideas = suggestions(entity, row, ws);
  const history = Array.isArray(row.data.activities) ? [...(row.data.activities as { id: string; text: string; user: string; created_at: string }[])].reverse() : [];
  const remove = async () => {
    if (!(await confirm({ title: `Hapus ${entityTitle(entity).toLowerCase()} ini?`, description: `"${String(row.data.title)}" akan dihapus permanen.`, confirmLabel: 'Hapus', danger: true }))) return;
    try {
      await api(entity, { id: row.id }, 'DELETE');
      toast.success('Catatan dihapus');
      onClose();
      await refresh();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={String(row.data.title || entityTitle(entity))}
      description={entityTitle(entity)}
      footer={
        <>
          {!UNDELETABLE.includes(entity) && (
            <Button variant="danger" onClick={() => void remove()}>
              <Trash2 />
              Hapus
            </Button>
          )}
          {entity !== 'stock-movements' && (
            <Button variant="primary" className="ml-auto" onClick={onEdit}>
              <Pencil />
              Ubah
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div data-tone={cardTone(entity, row, ws)} className="relative overflow-hidden rounded-[var(--radius-card)] bg-tone p-4 text-tone-ink">
          <Wave />
          <div className="relative flex flex-wrap gap-1.5">
            {statusOf(entity, row) && <Pill tone={statusTone(row.data.status)}>{statusOf(entity, row)}</Pill>}
            {summaryChips(entity, row, ws).map((chip) => (
              <span key={chip} className="rounded-full border border-tone-line px-2.5 py-0.5 text-xs font-semibold">{chip}</span>
            ))}
          </div>
          {keyFacts(entity, row, ws).length > 0 && (
            <p className="relative mt-3 text-sm font-bold">{keyFacts(entity, row, ws).join(' · ')}</p>
          )}
        </div>
        <EntityActions entity={entity} row={row} />
        {details.length > 0 && (
          <dl className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-2.5 text-sm">
            {details.map((detail) => (
              <div key={detail.field} className="contents">
                <dt className="text-ink-3">{detail.label}</dt>
                <dd className="font-semibold text-ink">{detail.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {longText.map((field) => (
          <section key={field}>
            <h3 className="mb-1.5 text-xs font-bold tracking-wide text-ink-3 uppercase">{detailRows(entity, row, ws).find((d) => d.field === field)?.label || field}</h3>
            <p className="rounded-2xl bg-surface-2 p-3 text-sm leading-relaxed whitespace-pre-wrap text-ink">{String(row.data[field])}</p>
          </section>
        ))}
        {ideas.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-bold tracking-wide text-ink-3 uppercase">Saran</h3>
            <div className="flex flex-col gap-2">
              {ideas.map((idea) => (
                <Link key={idea.id} href={idea.href} className="rounded-2xl bg-accent px-4 py-3 text-accent-ink transition hover:brightness-[0.98]">
                  <span className="block text-sm font-bold">{idea.label}</span>
                  <span className="block text-xs opacity-80">{idea.reason}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        {groups.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-bold tracking-wide text-ink-3 uppercase">Terkait</h3>
            <div className="flex flex-col gap-3">
              {groups.map((group) => (
                <div key={group.entity + group.direction + group.title}>
                  <p className="mb-1 text-[13px] font-semibold text-ink-2">
                    {group.title} <span className="text-ink-3">({group.rows.length})</span>
                  </p>
                  <ul className="flex flex-col gap-1">
                    {group.rows.slice(0, 8).map((related) => (
                      <li key={related.id}>
                        <Link href={recordLink(group.entity, related.id)} onClick={onClose} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface-3">
                          <CalendarClock className="size-4 text-ink-3" />
                          <span className="truncate">{String(related.data.title || entityTitle(group.entity))}</span>
                        </Link>
                      </li>
                    ))}
                    {group.rows.length > 8 && <li className="px-3 text-xs text-ink-3">+{group.rows.length - 8} catatan lain</li>}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        <section>
          <h3 className="mb-2 text-xs font-bold tracking-wide text-ink-3 uppercase">Riwayat</h3>
          <ol className="flex flex-col gap-2 border-l-2 border-line pl-4 text-sm">
            {history.slice(0, 20).map((entry) => (
              <li key={entry.id}>
                <span className="font-semibold text-ink">{entry.text}</span>
                <span className="block text-xs text-ink-3">{entry.user} · {formatDate(entry.created_at)}</span>
              </li>
            ))}
            {row.updated_at !== row.created_at && <li className={cn('text-ink-2')}>Diubah {formatDate(row.updated_at)}</li>}
            <li className="text-ink-2">Dibuat {formatDate(row.created_at)}</li>
          </ol>
        </section>
      </div>
    </Sheet>
  );
}
