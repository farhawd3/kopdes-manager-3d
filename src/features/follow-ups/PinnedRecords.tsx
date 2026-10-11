'use client';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useState } from 'react';
import { Pin, X } from 'lucide-react';
import { z } from 'zod';
import { usePreference } from '@/lib/usePreference';
import { Select } from '@/components/ui/Select';
import { recordHref } from '../workspace/workspace-navigation';
import { catalog } from '../records/catalog';
import type { Workspace } from '../workspace/useWorkspace';

const pinSchema = z
  .array(
    z.object({ entity: z.enum(['workstreams', 'work-items', 'documents']), id: z.string().min(1) }),
  )
  .max(50);
export function parsePins(value: string) {
  try {
    const result = pinSchema.safeParse(JSON.parse(value));
    return result.success
      ? result.data.filter(
          (pin, index, pins) =>
            pins.findIndex((other) => other.entity === pin.entity && other.id === pin.id) === index,
        )
      : [];
  } catch {
    return [];
  }
}

export function PinnedRecords({ data }: { data: Workspace }) {
  const [preference, setPreference] = usePreference('hub-pinned-records', '[]');
  const [selection, setSelection] = useState('');
  const pins = parsePins(preference);
  const records = (['workstreams', 'work-items', 'documents'] as const).flatMap((entity) =>
    (data[entity] || []).map((row) => ({ entity, row, key: `${entity}:${row.id}` })),
  );
  const options = records.filter(
    (record) => !pins.some((pin) => `${pin.entity}:${pin.id}` === record.key),
  );
  function addPin() {
    const record = options.find((record) => record.key === selection);
    if (!record || pins.length >= 50) return;
    setPreference(JSON.stringify([...pins, { entity: record.entity, id: record.row.id }]));
    setSelection('');
  }
  return (
    <section className="pinned-records" aria-labelledby="pinned-heading">
      <div className="section-head">
        <h2 id="pinned-heading">Catatan sematan</h2>
        <Pin size={18} aria-hidden />
      </div>
      <p>
        <small>
          Simpan akses cepat ke proyek, tugas, atau dokumen. Sematan tersimpan di peramban ini.
        </small>
      </p>
      <div className="pinned-toolbar">
        <Select
          value={selection}
          onChange={setSelection}
          ariaLabel="Catatan untuk disematkan"
          options={[
            { value: '', label: 'Pilih catatan yang sudah dimuat' },
            ...options.map(({ key, entity, row }) => ({
              value: key,
              label: `${catalog[entity].title} · ${row.data.title}`,
            })),
          ]}
        />
        <Button onClick={addPin} disabled={!selection || pins.length >= 50}>
          <Pin size={16} /> Sematkan
        </Button>
      </div>
      <div className="pinned-list">
        {pins.map((pin) => {
          const record = records.find((record) => record.key === `${pin.entity}:${pin.id}`);
          return (
            <div className="pinned-row" key={`${pin.entity}:${pin.id}`}>
              {record ? (
                <Link href={recordHref(pin.entity, record.row)}>
                  <small>{catalog[pin.entity].title}</small>
                  {String(record.row.data.title)}
                </Link>
              ) : (
                <span>
                  <small>{catalog[pin.entity].title}</small>Catatan belum dimuat atau sudah dihapus.
                </span>
              )}
              <Button
                aria-label={`Hapus sematan ${record ? record.row.data.title : catalog[pin.entity].title}`}
                onClick={() =>
                  setPreference(
                    JSON.stringify(
                      pins.filter((item) => item.entity !== pin.entity || item.id !== pin.id),
                    ),
                  )
                }
              >
                <X size={16} />
              </Button>
            </div>
          );
        })}
      </div>
      {!pins.length && <small>Belum ada sematan. Pilih catatan yang sering dibuka.</small>}
    </section>
  );
}
