'use client';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { useRef, useState } from 'react';
import { FileText, Heading2, List, ListChecks, Quote, Pencil, Save, CheckSquare, Square } from 'lucide-react';
import type { Item } from '../records/schemas';
import { api } from '@/lib/client';

export function NoteContent({ text }: { text: string }) {
  return (
    <div className="note-content">
      {text.split('\n').map((line, index) => {
        if (line.startsWith('## ')) return <h3 key={index}>{line.slice(3)}</h3>;
        if (line.startsWith('# ')) return <h2 key={index}>{line.slice(2)}</h2>;
        if (/^- \[[ xX]\] /.test(line))
          return (
            <div className="note-check" key={index}>
              <span className="note-check-icon" aria-label={line[3].toLowerCase() === 'x' ? 'Selesai' : 'Belum selesai'}>
                {line[3].toLowerCase() === 'x' ? (
                  <CheckSquare size={15} className="text-success" />
                ) : (
                  <Square size={15} className="text-muted" />
                )}
              </span>
              <span>{line.slice(6)}</span>
            </div>
          );
        if (line.startsWith('- '))
          return (
            <div className="note-bullet" key={index}>
              <span aria-hidden>•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        if (line.startsWith('> ')) return <blockquote key={index}>{line.slice(2)}</blockquote>;
        return line ? <p key={index}>{line}</p> : <div className="note-space" key={index} />;
      })}
    </div>
  );
}

export function ProjectNotes({
  project,
  refresh,
}: {
  project: Item;
  refresh: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false),
    [text, setText] = useState(String(project.data.notes || '')),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const insert = (value: string) => {
    const node = input.current;
    if (!node) return;
    const before = text.slice(0, node.selectionStart),
      after = text.slice(node.selectionEnd);
    setText(before + (before && !before.endsWith('\n') ? '\n' : '') + value + after);
    node.focus();
  };
  return (
    <section className="note-page card">
      <div className="section-head">
        <h3>
          <FileText size={19} />
          Catatan proyek
        </h3>
        {!editing && (
          <Button
            onClick={() => {
              setText(String(project.data.notes || ''));
              setEditing(true);
            }}
          >
            <Pencil size={15} />
            Tulis
          </Button>
        )}
      </div>
      {editing ? (
        <>
          <div className="note-toolbar" aria-label="Format catatan">
            <Button title="Judul" onClick={() => insert('## Judul\n')}>
              <Heading2 size={17} />
              <span>Judul</span>
            </Button>
            <Button onClick={() => insert('- Butir catatan\n')}>
              <List size={17} />
              <span>Daftar</span>
            </Button>
            <Button onClick={() => insert('- [ ] Butir pemeriksaan\n')}>
              <ListChecks size={17} />
              <span>Checklist</span>
            </Button>
            <Button onClick={() => insert('> Catatan penting\n')}>
              <Quote size={17} />
              <span>Kutipan</span>
            </Button>
          </div>
          <label>
            <span className="sr-only">Isi catatan proyek</span>
            <Textarea
              ref={input}
              rows={12}
              maxLength={5000}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Tulis tujuan, ide, keputusan, atau langkah berikutnya…"
            />
          </label>
          <small>{text.length}/5.000 karakter · Gunakan [x] untuk checklist selesai.</small>
          <details>
            <summary>Pratinjau catatan</summary>
            <NoteContent text={text} />
          </details>
          <div className="form-actions">
            <Button
              disabled={busy}
              onClick={() => {
                setEditing(false);
                setError('');
              }}
            >
              Batal
            </Button>
            <Button
              disabled={busy}
              className="primary"
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  await api('workstreams', {
                    id: project.id,
                    data: { ...project.data, notes: text },
                  });
                  await refresh();
                  setEditing(false);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Save size={16} />
              {busy ? 'Menyimpan…' : 'Simpan catatan'}
            </Button>
          </div>
        </>
      ) : project.data.notes ? (
        <NoteContent text={String(project.data.notes)} />
      ) : (
        <div className="note-placeholder">
          <FileText size={28} />
          <h3>Sebuah halaman untuk ide Anda.</h3>
          <p>
            Susun judul, daftar, checklist, dan kutipan. Catatan tetap terhubung dengan proyek ini.
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
    </section>
  );
}
