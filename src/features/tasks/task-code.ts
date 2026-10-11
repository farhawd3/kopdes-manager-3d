/**
 * Generator dan pemformat kode identitas rapi untuk Tugas (TGS-xxxx) dan Kegiatan (KGT-xxxx).
 * Format ringkas, elegan, dan terstruktur terinspirasi standar sistem manajemen modern.
 */

export function makeTaskCode(title: string, uniqueId: string, prefix = 'TGS'): string {
  const cleanId = uniqueId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || '0001';
  return `${prefix}-${cleanId}`;
}

export function makeActivityCode(title: string, uniqueId: string): string {
  return makeTaskCode(title, uniqueId, 'KGT');
}

/**
 * Format kode untuk ditampilkan di antarmuka (Tabel, Kalender, Kartu, Detail).
 * Mengonversi kode lama yang panjang (mis. MENGU-123456780000) menjadi format pendek yang rapi (TGS-1234).
 */
export function formatDisplayCode(
  code: string | undefined | null,
  entity: 'work-items' | 'journal' | string = 'work-items',
  fallbackId = '',
): string {
  const prefix = entity === 'journal' ? 'KGT' : 'TGS';

  if (code && typeof code === 'string' && code.trim()) {
    const trimmed = code.trim();
    // Jika format lama dengan hash 8-12 karakter (cth: MENGU-123456780000 atau RAPAT-ABCDEF010000)
    const oldHashMatch = trimmed.match(/^([A-Za-z0-9]+)-([A-Fa-f0-9]{6,16})$/);
    if (oldHashMatch) {
      return `${prefix}-${oldHashMatch[2].slice(0, 4).toUpperCase()}`;
    }
    return trimmed;
  }

  const cleanId = fallbackId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || '0001';
  return `${prefix}-${cleanId}`;
}
