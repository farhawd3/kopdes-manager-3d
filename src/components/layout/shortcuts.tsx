import { Kbd } from '@/components/ui/kbd';

export const SHORTCUTS: [string, string[]][] = [
  ['Cari dan buka apa saja', ['Ctrl', 'K']],
  ['Tambah tugas', ['N']],
  ['Pintasan ini', ['?']],
  ['Pindah tugas berikutnya / sebelumnya', ['J', 'K']],
  ['Centang tugas yang dipilih', ['X']],
  ['Buka tugas yang dipilih', ['Enter']],
  ['Geser kartu ke kolom lain (Papan)', ['Shift', '← →']],
  ['Pilih menu tambah cepat', ['1–9']],
  ['Tutup laci atau dialog', ['Esc']],
];

export function ShortcutList() {
  return (
    <dl className="divide-y divide-line">
      {SHORTCUTS.map(([label, keys]) => (
        <div key={label} className="flex items-center justify-between gap-4 py-3">
          <dt className="text-sm font-semibold text-ink-2">{label}</dt>
          <dd className="flex gap-1">
            {keys.map((key) => (
              <Kbd key={key} className="h-6 min-w-6 px-2 text-xs">
                {key}
              </Kbd>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
