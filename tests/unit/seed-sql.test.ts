// @vitest-environment node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sampleData } from '@/features/demo/sample-data';
import { sampleDeleteSql, sampleSeedSql } from '@/features/demo/sample-sql';

// Acuan tetap: tanggal hanya dipakai menghitung selisih hari, hasil SQL tidak bergantung hari ini.
const ACUAN = '2026-01-01';
const BERKAS = {
  'supabase/seed/SEED_DATA_CONTOH.sql': sampleSeedSql(sampleData(ACUAN), ACUAN),
  'supabase/seed/HAPUS_DATA_CONTOH.sql': sampleDeleteSql(),
};

describe('berkas SQL data contoh', () => {
  it('sesuai pembuatnya (perbarui dengan node scripts/build-seed.mjs)', () => {
    for (const [path, isi] of Object.entries(BERKAS)) {
      if (process.env.TULIS_SEED === '1') {
        mkdirSync('supabase/seed', { recursive: true });
        writeFileSync(path, isi);
      }
      expect(existsSync(path), path).toBe(true);
      expect(readFileSync(path, 'utf8').replace(/\r\n/g, '\n')).toBe(isi);
    }
  });
  it('tanggal menjadi selisih hari dan tanpa tanggal mentah', () => {
    const seed = BERKAS['supabase/seed/SEED_DATA_CONTOH.sql'];
    expect(seed).toContain('"date":"@d0"');
    expect(seed).not.toMatch(/"\d{4}-\d{2}-\d{2}"/);
    expect(seed.match(/^ {2}\('c0de0000/gm)?.length).toBe(sampleData(ACUAN).length);
  });
});
