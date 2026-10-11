'use client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, FileSearch, Search } from 'lucide-react';
import { navigation } from '../records/catalog';
import { searchWorkspace } from './workspace-navigation';
import type { Workspace } from './useWorkspace';

const scopes = [
  ['all', 'Semua'],
  ['work-items', 'Tugas'],
  ['workstreams', 'Proyek'],
  ['documents', 'Dokumen'],
  ['meetings', 'Rapat'],
] as const;

export function WorkspaceSearch({
  workspace,
  onNavigate,
}: {
  workspace: Workspace | null;
  onNavigate: () => void;
}) {
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<string>('all');
  const query = search.trim();
  const results = workspace ? searchWorkspace(workspace, query, scope) : [];
  const pages =
    scope === 'all'
      ? navigation.filter(([, label]) =>
          label.toLocaleLowerCase('id').includes(query.toLocaleLowerCase('id')),
        )
      : [];

  return (
    <div className="workspace-search">
      <label className="workspace-search-field">
        <Search size={20} aria-hidden="true" />
        <Input
          autoFocus
          className="ui-search-input"
          aria-label="Cari halaman atau isi catatan"
          type="search"
          placeholder="Judul, isi catatan, atau nama proyek…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <div className="workspace-search-scopes" role="group" aria-label="Jenis hasil pencarian">
        {scopes.map(([value, label]) => (
          <Button
            key={value}
            type="button"
            aria-pressed={scope === value}
            onClick={() => setScope(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <p className="workspace-search-hint">
        Catatan dicari dari data yang sudah dimuat, maksimal 30 hasil.
      </p>
      <div className="workspace-search-results" aria-live="polite">
        {query && (
          <>
            <div className="workspace-search-group">
              Catatan <span>{results.length}</span>
            </div>
            {results.map((result) => (
              <Link key={result.id} href={result.href} onClick={onNavigate}>
                <span className="workspace-search-icon">
                  <FileSearch size={18} />
                </span>
                <span className="workspace-search-copy">
                  <strong>{result.title}</strong>
                  <small>
                    {result.kind}
                    {result.context && ` · ${result.context}`}
                  </small>
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
            {!results.length && (
              <p>
                {workspace
                  ? 'Tidak ada catatan yang cocok pada data yang dimuat.'
                  : 'Catatan belum dimuat. Pencarian halaman tetap tersedia.'}
              </p>
            )}
          </>
        )}
        {!query && <p>Ketik kata kunci untuk mencari catatan, atau pilih halaman di bawah.</p>}
        {pages.length > 0 && (
          <div className="workspace-search-group">
            Halaman <span>{pages.length}</span>
          </div>
        )}
        {pages.map(([href, label]) => (
          <Link key={href} href={href} onClick={onNavigate}>
            <span className="workspace-search-copy">
              <strong>{label}</strong>
            </span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  );
}
