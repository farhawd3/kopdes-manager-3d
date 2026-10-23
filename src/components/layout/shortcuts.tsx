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
              <kbd
                key={key}
                className="rounded-lg bg-surface-3 px-2 py-1 text-xs font-bold text-ink-2"
              >
                {key}
              </kbd>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
