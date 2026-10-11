'use client';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { WeeklyReview } from './WeeklyReview';
import { PinnedRecords } from './PinnedRecords';
import { useState } from 'react';
import {
  ArrowUpRight,
  ListFilter,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getFollowUps } from '../workspace/workspace-navigation';
import type { Workspace } from '../workspace/useWorkspace';
import { today } from '@/lib/date';
import { Select } from '@/components/ui/Select';

export function FollowUps({ data, compact = false }: { data: Workspace; compact?: boolean }) {
  const [kind, setKind] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const items = getFollowUps(data, today());
  const distinctKinds = [...new Set(items.map((item) => item.kind))];
  const visible = items.filter((item) => !kind || item.kind === kind);
  const urgentCount = items.filter((i) => i.urgent).length;

  if (compact) {
    if (items.length === 0) {
      return (
        <div className="follow-up-compact-container">
          <div className="ui-followup-bar is-clean">
            <div className="compact-bar-info">
              <span className="compact-bar-icon success">
                <ShieldCheck size={16} />
              </span>
              <span className="compact-bar-text">
                Tidak ada pengingat pada catatan yang sudah dimuat.
              </span>
            </div>
            <Link href="/beranda#perhatian" className="compact-bar-link">
              Tinjau Catatan <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="follow-up-compact-container">
        <div className={`ui-followup-bar ${urgentCount > 0 ? 'is-urgent' : ''}`}>
          <div className="compact-bar-info">
            <span className={`compact-bar-icon ${urgentCount > 0 ? 'urgent' : 'warning'}`}>
              <AlertTriangle size={16} />
            </span>
            <div className="compact-bar-text-group">
              <div className="compact-bar-main-line">
                <span className="compact-bar-badge">
                  Perlu perhatian · {items.length}
                  {urgentCount > 0 ? ` · ${urgentCount} mendesak` : ''}
                </span>
                <span className="compact-bar-snippet">
                  {items[0].title}
                </span>
              </div>
            </div>
          </div>
          <div className="compact-bar-actions">
            <Button
              type="button"
              className="btn-toggle-compact-followup"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <>
                  <span>Ringkas</span> <ChevronUp size={14} />
                </>
              ) : (
                <>
                  <span>Rincian ({items.length})</span> <ChevronDown size={14} />
                </>
              )}
            </Button>
            <Link
              href="/beranda#perhatian"
              className="compact-bar-link"
              title="Buka halaman tindak lanjut penuh"
            >
              Semua <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {isExpanded && (
          <div className="follow-up-compact-expanded">
            <div className="follow-up-list">
              {visible.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`follow-up-row ${item.urgent ? 'is-urgent' : ''}`}
                >
                  <span className="follow-up-marker" aria-hidden="true" />
                  <div className="follow-up-row-content">
                    <small className="follow-up-kind">{item.kind}</small>
                    <strong className="follow-up-title">{item.title}</strong>
                    <span className="follow-up-reason">{item.reason}</span>
                  </div>
                  <ArrowUpRight size={18} className="follow-up-arrow" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="follow-up-wrapper">
      <section className="follow-up-panel" aria-label="Perlu perhatian">
        <div className="section-head">
          <div>
            <span className="panel-badge-subtle">PRIORITAS EVALUASI</span>
            <h2>
              Catatan Perlu Perhatian <span className="count-pill">{items.length}</span>
            </h2>
          </div>
        </div>
        <p className="follow-up-description">
          Pengingat tugas, rapat, dokumen, kendala, dan persediaan dari catatan yang sudah dimuat.
        </p>

        <div className="follow-up-toolbar">
          <div className="follow-up-filter-group">
            <span className="follow-up-filter-label">
              <ListFilter size={14} /> Jenis catatan
            </span>
            <Select
              value={kind}
              onChange={setKind}
              options={[
                { value: '', label: 'Semua Catatan' },
                ...distinctKinds.map((k) => ({ value: k, label: k })),
              ]}
              ariaLabel="Pilih jenis catatan"
            />
          </div>
          <span className="follow-up-count-badge">
            {visible.length} dari {items.length} catatan
          </span>
        </div>

        <div className="follow-up-list">
          {visible.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`follow-up-row ${item.urgent ? 'is-urgent' : ''}`}
            >
              <span className="follow-up-marker" aria-hidden="true" />
              <div className="follow-up-row-content">
                <small className="follow-up-kind">{item.kind}</small>
                <strong className="follow-up-title">{item.title}</strong>
                <span className="follow-up-reason">{item.reason}</span>
              </div>
              <ArrowUpRight size={18} className="follow-up-arrow" />
            </Link>
          ))}
        </div>

        {!visible.length && (
          <div className="follow-up-empty-card">
            <div className="follow-up-empty-icon">
              <ShieldCheck size={26} />
            </div>
            <div className="follow-up-empty-text">
              <strong>Belum ada tindak lanjut pada catatan yang dimuat</strong>
              <p>Periksa riwayat dan muat catatan lain bila Anda mencari pekerjaan lama.</p>
            </div>
          </div>
        )}

        <div className="follow-up-footer-note">
          <small>
            Daftar mengikuti data tersimpan. Selisih opname tidak mengubah stok buku secara
            otomatis.
          </small>
        </div>
      </section>

      <WeeklyReview data={data} />
      <details className="saved-records-details">
        <summary>Catatan sematan</summary>
        <PinnedRecords data={data} />
      </details>
    </div>
  );
}

