import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MonitoringDashboard } from '@/features/dunia-3d/MonitoringDashboard';
import type { Item } from '@/features/records/schemas';
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="office" /> }));
afterEach(cleanup);
const row = (id: string, data: Item['data']): Item => ({
  id,
  data,
  created_at: '',
  updated_at: '',
});
const data = {
  'work-items': [
    row('late', {
      title: 'Periksa berkas',
      assignee: 'Rina',
      due_date: '2000-01-01',
      status: 'proses',
    }),
    row('next', {
      title: 'Persiapan rapat',
      assignee: 'Budi',
      due_date: '2099-01-01',
      status: 'belum',
    }),
    row('done', { title: 'Sudah selesai', status: 'selesai' }),
  ],
  staff: [row('rina', { title: 'Rina', section: 'administrasi', status: 'aktif' })],
  documents: [row('doc', { title: 'Perjanjian gerai' })],
  'inventory-items': [
    row('beras', { title: 'Beras', rack: 'A', book_quantity: 2, minimum_quantity: 10 }),
  ],
  deliveries: [
    row('kirim', { title: 'Kiriman beras', status: 'tiba', dock: 'D2', driver_name: 'Agus' }),
  ],
};
function openPanel(name: string) {
  const button = within(screen.getByRole('navigation', { name: 'Panel dunia' })).getByRole(
    'button',
    { name },
  );
  if (button.getAttribute('aria-expanded') !== 'true') fireEvent.click(button);
}
const panel = () => {
  openPanel('Detail');
  return within(screen.getByRole('complementary', { name: 'Detail pilihan' }));
};
const LABEL = {
  kantor: 'Kantor',
  gerai: 'Gerai',
  gudang: 'Gudang',
  pendingin: 'Cold storage',
  pulau: 'Pulau koperasi',
};
/** Pemilih lokasi: tombol berlencana membuka daftar pilihan. */
function pilihLokasi(id: keyof typeof LABEL) {
  fireEvent.click(screen.getByRole('button', { name: /Ganti lokasi/ }));
  const list = within(screen.getByRole('listbox', { name: 'Pilih lokasi' }));
  fireEvent.click(list.getByRole('button', { name: new RegExp(`^[A-Z]+ ${LABEL[id]}`) }));
}
/** Ruang kantor dipilih lewat tab Ruang di daftar kanan bawah. */
function pilihRuang(nama: string) {
  openPanel('Daftar');
  fireEvent.click(screen.getByRole('tab', { name: /Ruang/ }));
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${nama}`) }));
}

it('ruang, tugas terlambat, figur tim, dan pencarian membuka catatan asli', () => {
  render(<MonitoringDashboard data={data} />);
  openPanel('Ringkasan');
  fireEvent.click(screen.getByRole('button', { name: /Lewat tenggat 1/ }));
  expect(
    panel()
      .getByRole('link', { name: /Periksa berkas/ })
      .getAttribute('href'),
  ).toBe('/tugas?task=late');
  expect(panel().queryByText('Persiapan rapat')).toBeNull();
  // Daftar tim memilih figur: panel menampilkan aktivitas dan tugas anggota.
  openPanel('Daftar');
  fireEvent.click(screen.getByRole('button', { name: /Rina .*Mengerjakan tugas/ }));
  expect(panel().getByRole('heading', { name: 'Rina' })).toBeTruthy();
  expect(panel().getByRole('link', { name: /Periksa berkas/ })).toBeTruthy();
  fireEvent.click(panel().getByRole('button', { name: 'Tutup pilihan' }));
  pilihRuang('Ruang manajer');
  expect(
    panel()
      .getByRole('link', { name: /Perjanjian gerai/ })
      .getAttribute('href'),
  ).toContain('record=doc');
  fireEvent.change(screen.getByLabelText('Cari catatan'), { target: { value: 'beras' } });
  const results = within(screen.getByRole('list', { name: 'Hasil pencarian' }));
  expect(results.getByText('Barang')).toBeTruthy();
  expect(results.getByText('Pengiriman')).toBeTruthy();
});

it('gudang: truk di dok, pelacak pengiriman, dan rak berstok minimum', () => {
  render(<MonitoringDashboard data={data} />);
  pilihLokasi('gudang');
  expect(panel().getByRole('heading', { name: 'Kiriman beras' })).toBeTruthy();
  expect(panel().getByText('Agus')).toBeTruthy();
  openPanel('Pengiriman');
  const tracker = within(screen.getByRole('region', { name: 'Pelacak pengiriman' }));
  expect(tracker.getByRole('listitem', { current: 'step' }).textContent).toContain('Tiba');
  openPanel('Daftar');
  fireEvent.click(screen.getByRole('tab', { name: /Rak/ }));
  fireEvent.click(screen.getByRole('button', { name: /Rak A/ }));
  expect(panel().getByText('1 di bawah minimum')).toBeTruthy();
  pilihLokasi('pendingin');
  expect(panel().getByRole('heading', { name: 'Rak C1' })).toBeTruthy();
});

it('galat menyembunyikan angka dan data lama; kemampuan server dibedakan dari nol', () => {
  const { rerender } = render(<MonitoringDashboard data={data} error="Koneksi terputus" />);
  expect(screen.getByRole('alert').textContent).toContain('Koneksi terputus');
  expect(screen.queryByText('Periksa berkas')).toBeNull();
  openPanel('Ringkasan');
  expect(screen.getByRole('button', { name: /Tugas terbuka/ }).textContent).toContain('—');
  rerender(<MonitoringDashboard data={{}} operations={false} logistics={false} />);
  pilihRuang('Kas & anggota');
  expect(
    panel().getAllByText('Pencatatan anggota dan kas belum aktif di server.').length,
  ).toBeGreaterThan(0);
  pilihLokasi('gudang');
  openPanel('Ringkasan');
  expect(screen.getByRole('button', { name: /Truk di lokasi/ }).textContent).toContain('—');
  expect(screen.getByText('Pengiriman belum aktif di server.')).toBeTruthy();
});

it('gerai: unit aktif buka, unit lain terkunci dengan tautan ke halaman Gerai', () => {
  render(
    <MonitoringDashboard
      data={{
        ...data,
        units: [
          row('u1', { title: 'Toko Sembako Desa', kind: 'sembako', status: 'aktif' }),
          row('u2', { title: 'Klinik Desa', kind: 'klinik', status: 'persiapan' }),
        ],
      }}
    />,
  );
  pilihLokasi('gerai');
  expect(panel().getByRole('heading', { name: 'Toko Sembako Desa' })).toBeTruthy();
  expect(panel().getByText('Buka')).toBeTruthy();
  openPanel('Daftar');
  fireEvent.click(screen.getByRole('button', { name: /Klinik Desa .*Terkunci/ }));
  expect(panel().getByText('Terkunci · Persiapan')).toBeTruthy();
  expect(panel().getByRole('link', { name: 'halaman Gerai' }).getAttribute('href')).toBe('/gerai');
  openPanel('Kesiapan');
  const tracker = within(screen.getByRole('region', { name: 'Kesiapan gerai' }));
  expect(tracker.getByRole('listitem', { current: 'step' }).textContent).toContain('Persiapan');
});

it('menampilkan keadaan parsial dan memuat halaman lanjutan', () => {
  const loadMore = vi.fn();
  render(<MonitoringDashboard data={{}} more={{ 'work-items': 100 }} loadMore={loadMore} />);
  expect(screen.getByText(/Ringkasan baru mencakup/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Muat lanjutan tugas' }));
  expect(loadMore).toHaveBeenCalledWith('work-items');
});

it('lonceng hanya menghitung tugas lewat tenggat dan risiko terbuka', () => {
  render(
    <MonitoringDashboard
      data={{ ...data, risks: [row('r1', { title: 'Stok minyak kosong', status: 'terbuka' })] }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Perlu perhatian: 2' }));
  const pop = within(screen.getByRole('dialog', { name: 'Perlu perhatian' }));
  expect(pop.getByText('Periksa berkas')).toBeTruthy();
  expect(pop.getByText('Stok minyak kosong')).toBeTruthy();
});

it('pulau membuka ruangan, cuaca dan suasana dapat diubah tanpa mengubah data', () => {
  render(<MonitoringDashboard data={data} />);
  pilihLokasi('pulau');
  expect(panel().getByText('Pulau melayang')).toBeTruthy();
  fireEvent.click(panel().getByRole('button', { name: /Gudang Rak barang/ }));
  expect(panel().getByRole('heading', { name: 'Kiriman beras' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /^Menu / }));
  fireEvent.change(screen.getByLabelText('Cuaca simulasi'), { target: { value: 'hujan' } });
  fireEvent.change(screen.getByLabelText('Suasana waktu'), { target: { value: 'senja' } });
  expect(screen.getByRole('main').getAttribute('data-cuaca')).toBe('hujan');
  expect(screen.getByRole('main').getAttribute('data-fase')).toBe('senja');
  expect(panel().getByText('Agus')).toBeTruthy();
  openPanel('Daftar');
  fireEvent.click(screen.getByRole('tab', { name: /Rak/ }));
  fireEvent.click(screen.getByRole('button', { name: /Rak A/ }));
  expect(panel().getByText('Beras')).toBeTruthy();
  expect(panel().getByText('2')).toBeTruthy();
});

it('proyek dan kesiapan gerai dari halaman web tampil di dunia', () => {
  render(
    <MonitoringDashboard
      data={{
        ...data,
        workstreams: [row('p1', { title: 'Pembukaan gerai', status: 'aktif', code: 'GRI' })],
        'work-items': [
          row('a', {
            title: 'Satu',
            status: 'selesai',
            workstream_id: 'p1',
            due_date: '2099-01-01',
          }),
          row('b', { title: 'Dua', status: 'proses', workstream_id: 'p1', due_date: '2099-01-01' }),
        ],
        units: [row('u2', { title: 'Klinik Desa', kind: 'klinik', status: 'siap buka' })],
        checklist: [
          row('c1', { title: 'Izin', unit_id: 'u2', required: true, status: 'selesai' }),
          row('c2', { title: 'SOP', unit_id: 'u2', required: true, status: 'proses' }),
        ],
      }}
    />,
  );
  openPanel('Daftar');
  fireEvent.click(screen.getByRole('tab', { name: /Proyek/ }));
  expect(
    screen.getByRole('link', { name: /Pembukaan gerai.*1\/2 tugas selesai/ }).getAttribute('href'),
  ).toBe('/proyek?id=p1');
  pilihLokasi('gerai');
  openPanel('Daftar');
  fireEvent.click(screen.getByRole('button', { name: /Klinik Desa .*Terkunci/ }));
  expect(panel().getByText('Kesiapan wajib')).toBeTruthy();
  expect(panel().getByText('50%')).toBeTruthy();
});

it('panel awal tertutup, hanya satu isi ditampilkan, Escape menutup dan mengembalikan fokus', () => {
  render(<MonitoringDashboard data={data} />);
  expect(screen.queryByRole('region', { name: 'Informasi dunia' })).toBeNull();
  openPanel('Ringkasan');
  expect(screen.getByRole('button', { name: /Tugas terbuka/ })).toBeTruthy();
  expect(screen.queryByRole('complementary', { name: 'Detail pilihan' })).toBeNull();
  openPanel('Daftar');
  expect(screen.queryByRole('button', { name: /Tugas terbuka/ })).toBeNull();
  const close = screen.getByRole('button', { name: 'Tutup panel informasi' });
  close.focus();
  fireEvent.keyDown(close, { key: 'Escape' });
  expect(screen.queryByRole('region', { name: 'Informasi dunia' })).toBeNull();
  expect(document.activeElement?.textContent).toBe('Daftar');
});
