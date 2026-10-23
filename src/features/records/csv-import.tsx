'use client';
import { useRef, useState } from 'react';
import { Download, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import type { ZodError } from 'zod';
import { catalog } from './catalog';
import { schemas, type Entity } from './schemas';
import { initialValues, fieldErrors } from './fields';
import { entityTitle, fieldLabel } from './related';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { parseCsv } from '@/lib/csv';
import { downloadCsv } from '@/lib/ledger';
import { api } from '@/lib/client';

/** Impor CSV: semua baris diperiksa dulu agar berkas yang salah tidak menyimpan sebagian data. */
export function CsvImportSheet({
  entity,
  open,
  onClose,
  refresh,
}: {
  entity: Entity;
  open: boolean;
  onClose: () => void;
  refresh: () => Promise<void> | void;
}) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const fields = catalog[entity].fields;
  const run = async (file: File) => {
    setMessage('');
    if (file.size > 5 * 1024 * 1024) return setMessage('Berkas CSV maksimal 5 MB.');
    let rows: Record<string, string>[];
    try {
      rows = parseCsv(await file.text());
    } catch (error) {
      return setMessage((error as Error).message);
    }
    const parsed = rows.map((row, index) => {
      const values = Object.fromEntries(
        Object.entries(row).filter(([key, value]) => fields.includes(key) && value.trim() !== ''),
      );
      return {
        line: index + 2,
        result: schemas[entity].safeParse({ ...initialValues(entity), ...values }),
      };
    });
    const problems = parsed.filter((row) => !row.result.success);
    if (problems.length)
      return setMessage(
        problems
          .slice(0, 6)
          .map(
            (row) =>
              `Baris ${row.line}: ${Object.entries(
                fieldErrors((row.result as { error: ZodError }).error),
              )
                .map(([field, msg]) => `${fieldLabel(entity, field)}: ${msg}`)
                .join(' · ')}`,
          )
          .join('\n'),
      );
    setBusy(true);
    let saved = 0;
    try {
      for (const row of parsed) {
        await api(entity, { data: (row.result as { data: unknown }).data });
        saved++;
      }
      toast.success(`${saved} baris tersimpan`);
      await refresh();
      onClose();
    } catch (error) {
      setMessage(
        `${saved} dari ${parsed.length} baris tersimpan. ${(error as Error).message} Impor ulang hanya baris yang belum tersimpan.`,
      );
      await refresh();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={`Impor CSV · ${entityTitle(entity)}`}
      description="Isi judul pada kolom title. Tanggal memakai YYYY-MM-DD; kolom kosong memakai nilai bawaan."
    >
      <div className="flex flex-col gap-4">
        <Button onClick={() => downloadCsv(`format-${entity}.csv`, fields, [])}>
          <Download />
          Unduh format CSV
        </Button>
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) void run(file);
          }}
          className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-line-strong px-6 py-10 text-center text-ink-2 transition hover:border-accent-strong hover:bg-accent/40"
        >
          <FileUp className="size-8 text-ink-3" />
          <span className="font-bold">
            {busy ? 'Menyimpan…' : 'Pilih atau tarik berkas CSV ke sini'}
          </span>
          <span className="text-xs text-ink-3">Maksimal 5 MB</span>
        </button>
        <input
          ref={input}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(event) => event.target.files?.[0] && void run(event.target.files[0])}
        />
        {message && (
          <p
            role="alert"
            className="rounded-2xl bg-late p-3 text-sm whitespace-pre-line text-late-ink"
          >
            {message}
          </p>
        )}
      </div>
    </Sheet>
  );
}
