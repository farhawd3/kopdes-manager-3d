import { today } from '@/lib/date';
import type { Item } from '@/features/records/schemas';
import type { Workspace } from '@/features/workspace/useWorkspace';

// Contoh khusus halaman development (?contoh=1) untuk memeriksa tampilan dunia berisi data.
// Semua judul diawali "Contoh" agar tidak terbaca sebagai catatan koperasi sungguhan.
const created = '2026-10-01T00:00:00Z';
const row = (id: string, data: Record<string, unknown>): Item => ({
  id,
  data,
  created_at: created,
  updated_at: created,
});

export function sampleWorkspace(): Workspace {
  const date = today();
  // [judul, rak, stok, minimum, satuan, gerai?] — rak C1–C3 = cold storage; gerai = barang di gerai.
  const items: [string, string, number, number, string, string?][] = [
    ['Contoh beras 5 kg', 'A', 40, 20, 'karung'],
    ['Contoh minyak 1 L', 'A', 6, 24, 'botol'],
    ['Contoh gula 1 kg', 'A', 30, 20, 'pak'],
    ['Contoh tepung 1 kg', 'B', 12, 10, 'pak'],
    ['Contoh telur', 'B', 3, 10, 'tray'],
    ['Contoh pupuk 25 kg', 'C', 18, 5, 'karung'],
    ['Contoh air mineral', 'D', 50, 24, 'dus'],
    ['Contoh sabun', 'D', 2, 12, 'pak'],
    ['Contoh kopi sachet', 'belum ditentukan', 20, 10, 'renceng'],
    ['Contoh ikan beku', 'C1', 14, 10, 'kg'],
    ['Contoh sayur segar', 'C1', 4, 8, 'ikat'],
    ['Contoh daging ayam', 'C2', 22, 10, 'kg'],
    ['Contoh susu UHT', 'belum ditentukan', 30, 12, 'kotak', 'unit-1'],
    ['Contoh mi instan', 'belum ditentukan', 6, 20, 'dus', 'unit-1'],
    ['Contoh minyak goreng gerai', 'belum ditentukan', 18, 10, 'botol', 'unit-1'],
    ['Contoh paracetamol', 'belum ditentukan', 40, 20, 'strip', 'unit-2'],
    ['Contoh vitamin C', 'belum ditentukan', 5, 10, 'botol', 'unit-2'],
  ];
  return {
    organization: [row('org', { title: 'Contoh Koperasi', manager: 'Contoh Manajer' })],
    units: [
      row('unit-1', { title: 'Contoh Gerai Sembako', kind: 'sembako', status: 'aktif', slot: '2' }),
      row('unit-2', { title: 'Contoh Apotek', kind: 'apotek', status: 'aktif' }),
      row('unit-3', { title: 'Contoh Klinik Desa', kind: 'klinik', status: 'siap buka' }),
      row('unit-4', { title: 'Contoh Simpan Pinjam', kind: 'simpan pinjam', status: 'aktif' }),
      row('unit-5', { title: 'Contoh Cold Storage', kind: 'cold storage', status: 'aktif' }),
      row('unit-6', { title: 'Contoh Gerai Kuliner', kind: 'kuliner', status: 'persiapan' }),
      row('unit-7', { title: 'Contoh Gudang Logistik', kind: 'logistik', status: 'aktif' }),
    ],
    members: [
      row('mem-1', { title: 'Contoh Anggota Sari', member_number: 'CTH-001', date, status: 'aktif' }),
      row('mem-2', { title: 'Contoh Anggota Joko', member_number: 'CTH-002', date, status: 'aktif' }),
    ],
    'cash-entries': [
      row('kas-1', { title: 'Contoh simpanan pokok', date, direction: 'masuk', amount: 100000, category: 'Simpanan', account: 'Kas' }),
      row('kas-2', { title: 'Contoh beli alat tulis', date, direction: 'keluar', amount: 35000, category: 'Operasional', account: 'Kas' }),
    ],
    risks: [row('risk-1', { title: 'Contoh risiko stok minyak kosong', status: 'terbuka', assignee: 'Contoh Citra' })],
    'inventory-items': items.map(([title, rack, stock, minimum, measurement, unit], index) =>
      row(`item-${index}`, {
        title,
        sku: `CTH-${index + 1}`,
        rack,
        book_quantity: stock,
        minimum_quantity: minimum,
        measurement,
        ...(unit ? { unit_id: unit } : {}),
      }),
    ),
    'work-items': [
      row('task-1', {
        title: 'Contoh cek stok minyak',
        status: 'proses',
        due_date: date,
        assignee: 'Contoh Budi',
      }),
      row('task-2', {
        title: 'Contoh susun rak B',
        status: 'rencana',
        due_date: '2026-10-01',
        assignee: 'Contoh Citra',
      }),
    ],
    staff: [
      row('st-1', {
        title: 'Contoh Ani',
        role: 'Kasir',
        unit_id: 'unit-1',
        status: 'aktif',
        section: 'layanan anggota',
        outfit: 'hijau',
        hair: 'berkerudung',
        work_hours: '00:00-23:59',
      }),
      row('st-2', {
        title: 'Contoh Budi',
        role: 'Admin',
        status: 'aktif',
        section: 'administrasi & keuangan',
        outfit: 'biru',
        hair: 'pendek',
        work_hours: '00:00-23:59',
      }),
      row('st-3', {
        title: 'Contoh Citra',
        role: 'Usaha',
        status: 'aktif',
        section: 'usaha & gerai',
        outfit: 'lavender',
        hair: 'panjang',
        work_hours: '00:00-23:59',
      }),
      row('st-4', {
        title: 'Contoh Dodi',
        role: 'Gudang',
        status: 'aktif',
        section: 'gudang & logistik',
        workplace: 'gudang',
        outfit: 'oranye',
        hair: 'topi',
        work_hours: '00:00-23:59',
      }),
      row('st-5', {
        title: 'Contoh Eka',
        role: 'Umum',
        status: 'aktif',
        section: 'umum',
        outfit: 'abu',
        hair: 'pendek',
        work_hours: '00:00-23:59',
      }),
    ],
    deliveries: [
      row('del-1', {
        title: 'Contoh kiriman beras',
        direction: 'masuk',
        status: 'tiba',
        dock: 'D2',
        vehicle: 'Contoh truk boks',
        driver_name: 'Budi Santoso',
        license_plate: 'AD 8123 KP',
        arrival_time: '08:30',
        planned_date: date,
        items: 'Beras Medium 50 karung @25kg',
      }),
      row('del-2', {
        title: 'Contoh kiriman minyak',
        direction: 'masuk',
        status: 'diperiksa',
        dock: 'D3',
        vehicle: 'Pickup L300',
        driver_name: 'Agus Supri',
        license_plate: 'AD 9045 EF',
        arrival_time: '09:15',
        planned_date: date,
        items: 'Minyak Goreng 20 dus @12L',
      }),
      row('del-3', {
        title: 'Contoh kiriman pupuk',
        direction: 'masuk',
        status: 'dikirim',
        vehicle: 'Truk Tronton',
        driver_name: 'Rudi Hartono',
        license_plate: 'AD 7721 CD',
        arrival_time: '14:00',
        planned_date: date,
        items: 'Pupuk NPK 40 sak @50kg',
      }),
    ],
    journal: [
      row('jur-1', { title: 'Contoh senam pagi tim', date, work_item_id: 'task-2', notes: 'Contoh catatan kegiatan' }),
    ],
    decisions: [row('dec-1', { title: 'Contoh keputusan jam buka gerai', date })],
    documents: [row('doc-1', { title: 'Contoh izin usaha', expires_date: date })],
    meetings: [
      row('meet-1', { title: 'Contoh briefing pagi', date, time: '08:00', duration: 30 }),
      row('meet-2', { title: 'Contoh rapat pengurus', date, time: '15:00', duration: 60 }),
    ],
  };
}
