import { describe, expect, it } from 'vitest';
import {
  parseQuickAdd,
  minutesBetween,
  buildDailyReport,
  addMinutes,
  countdownText,
} from '@/features/home/quick-add';
import { weekDays } from '@/lib/date';

// 19 Oktober 2026 jatuh pada hari Senin.
const context = {
  today: '2026-10-19',
  staff: ['Budi Darma', 'Ayu Rahma'],
  projects: [
    { id: 'p-gerai', title: 'Gerai sembako' },
    { id: 'p-rat', title: 'Rapat anggota tahunan' },
  ],
};

describe('parseQuickAdd', () => {
  it('mengenali PIC dari Tim, proyek, prioritas, dan kata waktu; sisanya judul', () => {
    expect(parseQuickAdd('Cek stok gula @budi #gerai besok !tinggi', context)).toEqual({
      title: 'Cek stok gula',
      assignee: 'Budi Darma',
      workstream_id: 'p-gerai',
      priority: 'tinggi',
      due_date: '2026-10-20',
    });
  });

  it('nama di luar Tim tetap dipakai apa adanya, dan #kata yang tidak cocok tidak dibuang', () => {
    const parsed = parseQuickAdd('Telepon pemasok #beras @Pak_Joko', context);
    expect(parsed.assignee).toBe('Pak Joko');
    expect(parsed.workstream_id).toBeUndefined();
    expect(parsed.title).toBe('Telepon pemasok #beras');
    expect(parseQuickAdd('Antar faktur @budi', { ...context, staff: [] }).assignee).toBe('Budi');
  });

  it('nama hari berarti hari itu berikutnya; senin pada hari Senin berarti pekan depan', () => {
    expect(parseQuickAdd('Setor laporan jumat', context).due_date).toBe('2026-10-23');
    expect(parseQuickAdd('Rapat staf senin', context).due_date).toBe('2026-10-26');
  });

  it('tgl/bln yang sudah lewat berarti tahun depan; tanggal mustahil diabaikan', () => {
    expect(parseQuickAdd('Bayar sewa 1/11', context).due_date).toBe('2026-11-01');
    expect(parseQuickAdd('Tutup buku 5/1', context).due_date).toBe('2027-01-05');
    const impossible = parseQuickAdd('Cek 31/2', context);
    expect('due_date' in impossible).toBe(false);
    expect(impossible.title).toBe('Cek 31/2');
  });

  it('kalimat kosong tetap menghasilkan judul bawaan', () => {
    expect(parseQuickAdd('  ', context).title).toBe('Tugas baru');
  });
});

describe('waktu agenda', () => {
  it('menambah durasi rapat tanpa melewati tengah malam', () => {
    expect(addMinutes('09:30', 90)).toBe('11:00');
    expect(addMinutes('23:30', 120)).toBe('23:59');
  });

  it('menghitung sisa waktu ke rapat berikutnya dalam kalimat ringkas', () => {
    expect(minutesBetween('09:12', '10:00')).toBe(48);
    expect(countdownText(48)).toBe('48 menit lagi');
    expect(countdownText(125)).toBe('2 jam 5 menit lagi');
    expect(countdownText(60)).toBe('1 jam lagi');
    expect(countdownText(0)).toBe('Mulai sekarang');
  });
});

describe('buildDailyReport', () => {
  it('memuat rutin, tugas selesai, jatuh tempo, terlambat, rapat, dan kegiatan', () => {
    const text = buildDailyReport({
      date: '2026-10-19',
      coop: 'KDMP Contoh',
      routines: [
        { title: 'Buka gerai', time: '07:30', done: true },
        { title: 'Setor kas', time: '15:00', done: false },
      ],
      tasks: [
        {
          title: 'Pasang rak',
          status: 'selesai',
          due: '2026-10-18',
          completedAt: '2026-10-19',
          assignee: 'Ayu',
        },
        {
          title: 'Selesai kemarin',
          status: 'selesai',
          due: '2026-10-17',
          completedAt: '2026-10-18',
        },
        { title: 'Cek timbangan', status: 'proses', due: '2026-10-19' },
        { title: 'Kirim undangan', status: 'rencana', due: '2026-10-14', assignee: 'Sinta' },
        { title: 'Dibatalkan', status: 'dibatalkan', due: '2026-10-10' },
      ],
      meetings: [
        { title: 'Rapat pengurus', time: '10:00', kind: 'Rapat' },
        { title: 'Ke gudang pemasok', time: '13:00', kind: 'Kunjungan' },
      ],
      activities: [{ title: 'Survei lokasi' }],
    });
    expect(text).toContain(`*LAPORAN KERJA HARIAN*
Senin, 19 Oktober 2026
KDMP Contoh`);
    expect(text).toContain(
      `*Ringkasan*
• Rutin: 1 dari 2 selesai
• Tugas selesai hari ini: 1
• Jatuh tempo hari ini: 1
• Terlambat: 1`,
    );
    expect(text).toContain(`*1. Rutin harian (1/2)*
✅ 07.30 Buka gerai`);
    expect(text).toContain('⬜ 15.00 Setor kas');
    expect(text).toContain(`*2. Tugas selesai hari ini*
1. Pasang rak — Ayu`);
    expect(text).toContain(`*3. Jatuh tempo hari ini*
1. Cek timbangan`);
    expect(text).toContain(
      `*4. Terlambat*
1. Kirim undangan — Sinta (tenggat 14 Okt, lewat 5 hari)`,
    );
    expect(text).toContain(
      `*5. Agenda hari ini*
1. 10.00 Rapat pengurus
2. 13.00 Ke gudang pemasok (kunjungan)`,
    );
    expect(text).toContain(`*6. Kegiatan tercatat*
1. Survei lokasi`);
    expect(text).not.toContain('Selesai kemarin');
    expect(text).not.toContain('Dibatalkan');
  });

  it('data yang tidak dimuat dilewati, dan hari kosong ditulis jujur', () => {
    const text = buildDailyReport({ date: '2026-10-19', routines: [], tasks: [] });
    expect(text).not.toContain('Agenda hari ini');
    expect(text).toContain('Belum ada pekerjaan tercatat hari ini.');
  });
});

it('weekDays memberi Senin sampai Minggu pekan yang sama', () => {
  expect(weekDays('2026-10-21')).toEqual([
    '2026-10-19',
    '2026-10-20',
    '2026-10-21',
    '2026-10-22',
    '2026-10-23',
    '2026-10-24',
    '2026-10-25',
  ]);
  expect(weekDays('2026-10-25')[0]).toBe('2026-10-19');
});
