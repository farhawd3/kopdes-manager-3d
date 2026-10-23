'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { prefillFromQuery } from './related';

const UUID = /^[a-f\d-]{36}$/i;
const TRANSIENT = [
  'new',
  'baru',
  'record',
  'task',
  'edit',
  'ubah',
  'direction',
  'arah',
  'item',
  'barang',
  'assignee',
  'penanggung',
];

/**
 * Parameter tautan halaman: catatan yang dibuka (?record), formulir baru (?new=1 + fill.*),
 * dan ubah langsung (?edit=1). Nama lama dari dunia 3D (?baru, isi.*, ?arah, ?barang,
 * ?penanggung, ?ubah) tetap dibaca agar tautan lama tidak putus.
 */
export function useRecordParams() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const record = params.get('record');
  const prefill = (() => {
    const values: Record<string, string> = prefillFromQuery(params);
    const direction = params.get('direction') || params.get('arah');
    if (direction === 'masuk' || direction === 'keluar') values.direction = direction;
    const assignee = params.get('assignee') || params.get('penanggung');
    if (assignee) values.assignee = assignee;
    const item = params.get('item') || params.get('barang');
    if (item && UUID.test(item)) values.item_id = item;
    return values;
  })();
  const clear = () => {
    const next = new URLSearchParams(params.toString());
    for (const key of [...next.keys()])
      if (TRANSIENT.includes(key) || key.startsWith('fill.') || key.startsWith('isi.'))
        next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false });
  };
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null) next.delete(key);
    else next.set(key, value);
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false });
  };
  return {
    params,
    record: record && UUID.test(record) ? record : null,
    isNew:
      params.get('new') === '1' ||
      params.get('baru') === '1' ||
      Boolean(params.get('penanggung')) ||
      Boolean(params.get('barang')),
    edit: params.get('edit') === '1' || params.get('ubah') === '1',
    prefill,
    clear,
    setParam,
  };
}
