import { schemas, type Entity, type Item } from '@/features/records/schemas';
import { addDays } from '@/lib/date';

/**
 * Data contoh koperasi fiktif untuk mode demo dan berkas SEED_DATA_CONTOH.sql.
 * Semua nama, nomor, dan angka dibuat acak dengan bibit tetap sehingga hasilnya selalu sama.
 * Penanda contoh: setiap id diawali `c0de0000`, dipakai berkas HAPUS_DATA_CONTOH.sql.
 */
export const SAMPLE_ID_PREFIX = 'c0de0000';

/** PRNG mulberry32: deterministik, cukup untuk memilih nama dan angka. */
function seededRandom(seed: number) {
  let a = seed >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    r,
    int: (min: number, max: number) => min + Math.floor(r() * (max - min + 1)),
    pick: <T>(options: readonly T[]) => options[Math.floor(r() * options.length)],
  };
}

const ENTITIES: Entity[] = Object.keys(schemas) as Entity[];
/** UUID v4 valid: c0de0000-EEEE-4000-8000-NNNNNNNNNNNN (E = nomor entitas, N = urutan). */
const sampleId = (entity: Entity, n: number) =>
  `${SAMPLE_ID_PREFIX}-${String(ENTITIES.indexOf(entity) + 1).padStart(4, '0')}-4000-8000-${String(n).padStart(12, '0')}`;

const FIRST_NAMES = [
  'Sari',
  'Budi',
  'Rina',
  'Agus',
  'Dewi',
  'Joko',
  'Siti',
  'Wahyu',
  'Lestari',
  'Eko',
  'Ratna',
  'Hendra',
  'Yuni',
  'Bambang',
  'Ika',
  'Teguh',
  'Fitri',
  'Dimas',
  'Wulan',
  'Arif',
  'Nur',
  'Slamet',
  'Endah',
  'Rudi',
  'Tri',
  'Ayu',
  'Gilang',
  'Puji',
  'Danang',
  'Indah',
  'Yoga',
  'Murni',
  'Heru',
  'Novi',
  'Bayu',
  'Sri',
] as const;
const LAST_NAMES = [
  'Santoso',
  'Wijaya',
  'Lestari',
  'Pratama',
  'Kusuma',
  'Hartono',
  'Rahayu',
  'Saputra',
  'Wibowo',
  'Utami',
  'Setiawan',
  'Purnomo',
  'Handayani',
  'Nugroho',
  'Susanti',
  'Prasetyo',
  'Maharani',
  'Firmansyah',
] as const;
const HAMLETS = ['Krajan', 'Sumberejo', 'Ngasem', 'Tegalsari', 'Kedungrejo', 'Margomulyo'] as const;

type Draft = { entity: Entity; data: Record<string, unknown> };
export type SampleItem = Item & { entity: Entity };

/**
 * Membuat seluruh catatan contoh. `hariIni` = tanggal acuan (YYYY-MM-DD, Asia/Jakarta);
 * semua tanggal relatif terhadapnya agar rapat "hari ini" dan tugas terlambat selalu tampak.
 */
export function sampleData(baseDate: string): SampleItem[] {
  const g = seededRandom(20261010);
  const dayOffset = (n: number) => addDays(baseDate, n);
  const usedNames = new Set<string>();
  const randomPerson = () => {
    for (;;) {
      const n = `${g.pick(FIRST_NAMES)} ${g.pick(LAST_NAMES)}`;
      if (!usedNames.has(n)) return (usedNames.add(n), n);
    }
  };
  const drafts: Draft[] = [];
  const counters = new Map<Entity, number>();
  const addRecord = (entity: Entity, data: Record<string, unknown>) => {
    const n = (counters.get(entity) ?? 0) + 1;
    counters.set(entity, n);
    drafts.push({ entity, data: { ...data, __id: sampleId(entity, n) } });
    return sampleId(entity, n);
  };

  // ---- Staf (manajer pertama) dan organisasi
  const STAFF_PLAN: [string, string, string, string, string, string][] = [
    // [peran, seksi, tempat, posisi, kepala, rambut]
    ['Manajer koperasi', 'umum', 'kantor', 'pengurus', 'peci', 'pendek'],
    ['Kasir & layanan anggota', 'layanan anggota', 'kantor', 'karyawan', 'hijab', 'belum diisi'],
    ['Admin keuangan', 'administrasi & keuangan', 'kantor', 'karyawan', 'tidak ada', 'panjang'],
    ['Bendahara', 'administrasi & keuangan', 'kantor', 'pengurus', 'hijab', 'belum diisi'],
    ['Kepala gudang', 'gudang & logistik', 'gudang', 'karyawan', 'topi KDMP', 'pendek'],
    ['Staf bongkar muat', 'gudang & logistik', 'gudang', 'karyawan', 'tidak ada', 'ikal'],
    ['Penjaga gerai sembako', 'usaha & gerai', 'gerai', 'karyawan', 'hijab', 'belum diisi'],
    ['Asisten apoteker', 'usaha & gerai', 'gerai', 'karyawan', 'tidak ada', 'panjang'],
    ['Koordinator usaha', 'usaha & gerai', 'kantor', 'karyawan', 'tidak ada', 'pendek'],
    ['Pengawas', 'umum', 'kantor', 'pengawas', 'peci', 'pendek'],
  ];
  const OUTFITS = ['biru', 'hijau', 'oranye', 'lavender', 'abu'] as const;
  const staffMembers = STAFF_PLAN.map(([role, section, workplace, position, head, hair]) => ({
    nama: randomPerson(),
    role,
    section,
    workplace,
    position,
    head,
    hair,
  }));
  const managerName = staffMembers[0].nama;
  addRecord('organization', {
    title: 'KDMP Sukamaju (contoh)',
    village: 'Sukamaju',
    district: 'Ngadirejo',
    regency: 'Temanggung',
    province: 'Jawa Tengah',
    manager: managerName,
    start_date: dayOffset(-120),
    target_date: dayOffset(240),
  });

  // ---- Unit gerai: status bercampur agar gembok terlihat
  const UNIT_PLAN: [string, string, string, string?][] = [
    ['Gerai Sembako Sukamaju', 'sembako', 'aktif'],
    ['Apotek Desa', 'apotek', 'aktif'],
    ['Klinik Desa', 'klinik', 'siap buka'],
    ['Simpan Pinjam', 'simpan pinjam', 'aktif'],
    ['Cold Storage Hasil Tani', 'cold storage', 'aktif'],
    ['Gudang Logistik', 'logistik', 'aktif'],
    ['Gerai Kopi Lereng', 'kuliner', 'persiapan', '1'],
    ['Pengolahan Tembakau', 'olahan', 'rencana', '2'],
    ['Wisata Embung', 'wisata', 'rencana', '3'],
  ];
  const unitIds = UNIT_PLAN.map(([title, kind, status, slot]) =>
    addRecord('units', {
      title,
      kind,
      status,
      slot: slot ?? 'otomatis',
      location: `Dusun ${g.pick(HAMLETS)}`,
      assignee: '',
      physical: status === 'rencana' ? 'Lahan belum disiapkan' : 'Bangunan tersedia',
      equipment: status === 'aktif' ? 'Lengkap' : 'Sebagian',
    }),
  );
  const activeUnitId = (i: number) => unitIds[i];

  const staffIds = staffMembers.map((s, i) =>
    addRecord('staff', {
      title: s.nama,
      role: s.role,
      unit_id:
        i === 6
          ? activeUnitId(0)
          : i === 7
            ? activeUnitId(1)
            : i === 4 || i === 5
              ? activeUnitId(5)
              : '',
      status: 'aktif',
      section: s.section,
      workplace: s.workplace,
      work_hours: i < 4 ? '07:30-15:30' : '07:00-16:00',
      outfit: OUTFITS[i % OUTFITS.length],
      position: s.position,
      look_head: s.head,
      look_hair: s.hair,
      look_skin: g.pick(['terang', 'sawo matang', 'sawo matang', 'gelap'] as const),
      look_glasses: i === 2 || i === 9 ? 'ya' : 'tidak',
    }),
  );
  // Penanggung jawab unit diisi setelah staf ada.
  for (const b of drafts)
    if (b.entity === 'units') b.data.assignee = staffMembers[g.int(6, 8)].nama;

  // ---- Proyek, milestone, sprint
  const PROJECT_PLAN: [string, string, string, string][] = [
    ['Pembukaan gerai baru', 'GRI', 'aktif', '#e8577a'],
    ['Penataan gudang & logistik', 'GDG', 'aktif', '#e8822f'],
    ['Layanan anggota digital', 'AGT', 'aktif', '#4a86dc'],
    ['Legalitas & perizinan', 'LGL', 'rencana', '#2fa874'],
  ];
  const projectIds = PROJECT_PLAN.map(([title, code, status, color], i) =>
    addRecord('workstreams', {
      title,
      code,
      status,
      color,
      priority: i === 0 ? 'tinggi' : 'normal',
      assignee: staffMembers[[8, 4, 1, 3][i]].nama,
      start_date: dayOffset(-60 + i * 7),
      target_date: dayOffset(30 + i * 20),
      budget: [15_000_000, 6_000_000, 0, 0][i],
      description: `Proyek contoh: ${title.toLowerCase()}.`,
    }),
  );
  const milestone = projectIds.map((p, i) =>
    addRecord('milestones', {
      title: [
        'Gerai kopi siap uji',
        'Rak A–F berlabel',
        '100 anggota terdaftar',
        'Izin usaha terbit',
      ][i],
      workstream_id: p,
      due_date: dayOffset(10 + i * 9),
      actual_date: '',
    }),
  );
  const sprint = addRecord('sprints', {
    title: 'Sprint Oktober',
    goal: 'Gerai kopi siap uji dan stok minimum aman',
    duration: '2 minggu',
    start_date: dayOffset(-5),
    end_date: dayOffset(9),
    status: 'aktif',
  });

  // ---- Mitra dan interaksi
  const partnerIds = [
    ['CV Tani Makmur', 'Pemasok pupuk'],
    ['PT Sumber Pangan', 'Pemasok sembako'],
    ['Puskesmas Ngadirejo', 'Mitra kesehatan'],
    ['Bank Desa', 'Mitra keuangan'],
    ['Pemerintah Desa Sukamaju', 'Pemerintah'],
  ].map(([title, category], i) =>
    addRecord('stakeholders', {
      title,
      category,
      contact: `08${g.int(11, 59)}-${g.int(1000, 9999)}-${g.int(1000, 9999)}`,
      influence: g.int(2, 5),
      interest: g.int(2, 5),
      last_contact: dayOffset(-g.int(1, 20)),
      follow_up: i < 2 ? 'Konfirmasi jadwal kirim berikutnya' : '',
    }),
  );
  for (let i = 0; i < 4; i++)
    addRecord('interactions', {
      title: [
        'Negosiasi harga pupuk',
        'Kunjungan gudang pemasok',
        'Koordinasi layanan klinik',
        'Diskusi pembiayaan',
      ][i],
      stakeholder_id: partnerIds[i],
      date: dayOffset(-g.int(2, 25)),
      notes: 'Catatan contoh hasil pertemuan.',
    });

  // ---- Rapat (dua hari ini) dan keputusan
  const meetingIds = [
    addRecord('meetings', {
      title: 'Briefing pagi tim',
      date: dayOffset(0),
      time: '08:00',
      duration: 30,
      participants: staffMembers
        .slice(0, 6)
        .map((s) => s.nama)
        .join(', '),
      agenda: 'Pembagian tugas harian dan kiriman masuk',
      mode: 'tatap muka',
      location: 'Ruang rapat kantor',
    }),
    addRecord('meetings', {
      title: 'Rapat pengurus bulanan',
      date: dayOffset(0),
      time: '14:00',
      duration: 90,
      participants: [staffMembers[0], staffMembers[3], staffMembers[9]]
        .map((s) => s.nama)
        .join(', '),
      agenda: 'Evaluasi kas bulan lalu dan rencana gerai kopi',
      mode: 'hybrid',
      location: 'Ruang rapat kantor',
    }),
    addRecord('meetings', {
      title: 'Koordinasi pemasok sembako',
      date: dayOffset(2),
      time: '10:00',
      duration: 60,
      participants: `${staffMembers[4].nama}, ${staffMembers[8].nama}`,
      agenda: 'Jadwal kirim dan harga minyak goreng',
      mode: 'online',
      meeting_url: 'https://meet.example.com/kdmp-sukamaju',
    }),
  ];
  for (const [i, title] of [
    'Jam buka gerai sembako 07.00–20.00',
    'Minimum stok minyak goreng 24 botol',
    'Gerai kopi uji coba dua minggu',
    'Simpanan wajib dicatat setiap tanggal 5',
  ].entries())
    addRecord('decisions', {
      title,
      meeting_id: i < 2 ? meetingIds[0] : '',
      date: dayOffset(-i * 6),
      reason: 'Keputusan contoh hasil rapat.',
    });

  // ---- Dokumen, risiko, isu
  const documentIds = [
    ['Akta pendirian koperasi', 'Akta', 'tersedia', -300, 0],
    ['NIB koperasi', 'Perizinan', 'tersedia', -200, 0],
    ['Izin apotek desa', 'Perizinan', 'tersedia', -150, 20],
    ['Izin klinik desa', 'Perizinan', 'diproses', 0, 0],
    ['SOP gudang', 'SOP', 'belum ada', 0, 0],
  ].map(([title, kind, status, issuedOffset, expiryOffset]) =>
    addRecord('documents', {
      title,
      kind,
      status,
      number: status === 'tersedia' ? `${g.int(100, 999)}/KDMP/${g.int(1, 12)}/2026` : '',
      issued_date: issuedOffset ? dayOffset(Number(issuedOffset)) : '',
      expires_date: expiryOffset ? dayOffset(Number(expiryOffset)) : '',
    }),
  );
  for (const [title, p, d, status] of [
    ['Stok minyak goreng di bawah minimum', 4, 3, 'terbuka'],
    ['Listrik cold storage padam saat hujan', 2, 5, 'ditangani'],
    ['Piutang anggota simpan pinjam menumpuk', 3, 4, 'terbuka'],
  ] as const)
    addRecord('risks', {
      title,
      probability: p,
      impact: d,
      status,
      assignee: staffMembers[g.int(1, 5)].nama,
      mitigation: 'Langkah contoh untuk mengurangi risiko.',
      review_date: dayOffset(g.int(1, 14)),
    });
  const issueIds = [
    addRecord('issues', {
      title: 'Timbangan gerai sembako tidak akurat',
      assignee: staffMembers[6].nama,
      due_date: dayOffset(2),
      status: 'terbuka',
      description: 'Selisih 50 gram tiap penimbangan.',
    }),
    addRecord('issues', {
      title: 'Freezer C2 berbunyi keras',
      assignee: staffMembers[4].nama,
      due_date: dayOffset(-1),
      status: 'ditangani',
    }),
  ];

  // ---- Barang (sebagian di bawah minimum) — [judul, rak, stok, minimum, satuan, harga, gerai?]
  const ITEM_PLAN: [string, string, number, number, string, number, number?][] = [
    ['Beras medium 5 kg', 'A', 64, 30, 'karung', 68000],
    ['Beras premium 5 kg', 'A', 22, 20, 'karung', 78000],
    ['Minyak goreng 1 L', 'A', 9, 24, 'botol', 17500],
    ['Gula pasir 1 kg', 'A', 41, 20, 'pak', 17000],
    ['Tepung terigu 1 kg', 'B', 18, 12, 'pak', 12500],
    ['Telur ayam', 'B', 4, 10, 'tray', 52000],
    ['Mi instan', 'B', 36, 40, 'dus', 115000],
    ['Pupuk NPK 50 kg', 'C', 26, 10, 'sak', 380000],
    ['Pupuk urea 50 kg', 'C', 7, 10, 'sak', 290000],
    ['Bibit jagung hibrida', 'C', 30, 15, 'pak', 95000],
    ['Air mineral 600 ml', 'D', 58, 24, 'dus', 42000],
    ['Galon isi ulang', 'D', 15, 20, 'galon', 6000],
    ['Sabun cuci', 'D', 3, 12, 'pak', 21000],
    ['Kardus kemasan', 'E', 120, 50, 'lembar', 3500],
    ['Karung plastik', 'E', 80, 40, 'lembar', 2500],
    ['Terpal 4×6', 'F', 6, 4, 'lembar', 160000],
    ['Ikan nila beku', 'C1', 34, 20, 'kg', 32000],
    ['Sayur segar', 'C1', 5, 12, 'ikat', 6000],
    ['Daging ayam', 'C2', 21, 15, 'kg', 38000],
    ['Susu segar', 'C3', 8, 10, 'liter', 15000],
    ['Paracetamol 500 mg', 'belum ditentukan', 60, 30, 'strip', 4500, 1],
    ['Vitamin C 50 mg', 'belum ditentukan', 6, 15, 'botol', 18000, 1],
    ['Minyak kayu putih', 'belum ditentukan', 14, 10, 'botol', 23000, 1],
    ['Kopi bubuk robusta', 'belum ditentukan', 12, 8, 'pak', 35000, 0],
    ['Teh celup', 'belum ditentukan', 25, 12, 'kotak', 9000, 0],
  ];
  const itemIds = ITEM_PLAN.map(
    ([title, rack, bookStock, minimum, measurement, price, outletIndex], i) =>
      addRecord('inventory-items', {
        title,
        sku: `BRG-${String(i + 1).padStart(3, '0')}`,
        rack,
        book_quantity: bookStock,
        minimum_quantity: minimum,
        measurement,
        price,
        unit_id: outletIndex === undefined ? '' : activeUnitId(outletIndex),
      }),
  );

  // ---- Pengiriman di berbagai tahap
  const shipmentIds = [
    ['Kiriman beras dari PT Sumber Pangan', 'masuk', 'tiba', 'D1', 'Truk boks', '08:30', 1],
    ['Kiriman minyak goreng', 'masuk', 'diperiksa', 'D2', 'Pickup L300', '09:15', 1],
    ['Kiriman pupuk NPK', 'masuk', 'dikirim', 'belum ditentukan', 'Truk engkel', '13:00', 0],
    ['Antar sembako ke gerai', 'keluar', 'dipesan', 'D3', 'Mobil boks koperasi', '15:00', -1],
  ].map(([title, direction, status, dock, vehicle, clock, m]) =>
    addRecord('deliveries', {
      title,
      direction,
      status,
      dock,
      vehicle,
      driver_name: randomPerson(),
      license_plate: `AA ${g.int(1000, 9999)} ${g.pick(['KP', 'TM', 'BN', 'SD'])}`,
      arrival_time: clock,
      planned_date: dayOffset(0),
      arrived_date: status === 'tiba' || status === 'diperiksa' ? dayOffset(0) : '',
      stakeholder_id: Number(m) >= 0 ? partnerIds[Number(m)] : '',
      unit_id: direction === 'keluar' ? activeUnitId(0) : '',
      items: g.pick(['50 karung', '20 dus', '40 sak', '12 koli']),
    }),
  );

  // ---- Mutasi stok (riwayat; stok buku akhir = book_quantity barang)
  for (const [i, b, kind, qty, d] of [
    [0, 0, 'masuk', 30, -6],
    [1, 2, 'keluar', 15, -3],
    [2, 7, 'masuk', 20, -2],
    [3, 5, 'keluar', 6, -1],
  ] as const) {
    const unitName = ITEM_PLAN[b][2];
    addRecord('stock-movements', {
      title: `${kind === 'masuk' ? 'Terima' : 'Keluarkan'} ${ITEM_PLAN[b][0].toLowerCase()}`,
      item_id: itemIds[b],
      kind,
      quantity: qty,
      date: dayOffset(d),
      delivery_id: i === 0 ? shipmentIds[0] : '',
      reference_number: `MTS-${String(i + 1).padStart(4, '0')}`,
      book_before: kind === 'masuk' ? unitName - qty : unitName + qty,
      book_after: unitName,
    });
  }
  for (const b of [2, 5, 12])
    addRecord('stock-counts', {
      title: `Opname ${ITEM_PLAN[b][0].toLowerCase()}`,
      item_id: itemIds[b],
      date: dayOffset(-g.int(3, 10)),
      book_quantity: ITEM_PLAN[b][2],
      counted_quantity: Math.max(0, ITEM_PLAN[b][2] - g.int(0, 2)),
      assignee: staffMembers[4].nama,
    });

  // ---- Anggota
  const memberNames: string[] = [];
  for (let i = 0; i < 40; i++)
    memberNames.push(
      addRecord('members', {
        title: randomPerson(),
        member_number: `AGT-${String(i + 1).padStart(4, '0')}`,
        date: dayOffset(-g.int(5, 110)),
        contact: `08${g.int(11, 59)}-${g.int(1000, 9999)}-${g.int(1000, 9999)}`,
        address: `Dusun ${g.pick(HAMLETS)} RT ${g.int(1, 6)}/RW ${g.int(1, 3)}`,
        status: i % 13 === 12 ? 'nonaktif' : 'aktif',
      }),
    );

  // ---- Buku kas satu bulan (hanya uang masuk/keluar tercatat)
  for (let d = -29; d <= 0; d++) {
    if (g.r() < 0.35) continue;
    const isIncome = g.r() < 0.6;
    const [title, category, amount] = isIncome
      ? g.pick([
          ['Simpanan wajib anggota', 'Simpanan', 50000],
          ['Simpanan pokok anggota baru', 'Simpanan', 100000],
          ['Penjualan gerai sembako', 'Penjualan', g.int(8, 30) * 50000],
          ['Penjualan apotek desa', 'Penjualan', g.int(4, 16) * 25000],
          ['Sewa cold storage', 'Jasa', 150000],
        ] as const)
      : g.pick([
          ['Bayar listrik kantor', 'Operasional', 420000],
          ['Beli alat tulis', 'Operasional', 65000],
          ['Belanja stok sembako', 'Pembelian', g.int(10, 40) * 100000],
          ['Upah bongkar muat', 'Upah', 250000],
          ['Perawatan freezer', 'Perawatan', 300000],
        ] as const);
    addRecord('cash-entries', {
      title,
      date: dayOffset(d),
      direction: isIncome ? 'masuk' : 'keluar',
      amount,
      category,
      account: g.r() < 0.7 ? 'Kas tunai' : 'Rekening koperasi',
      member_id: category === 'Simpanan' ? g.pick(memberNames) : '',
      // Upah bongkar muat dan perawatan freezer dibebankan ke proyek gudang (contoh realisasi anggaran).
      workstream_id: category === 'Upah' || category === 'Perawatan' ? projectIds[1] : '',
      unit_id: category === 'Penjualan' ? activeUnitId(title.includes('apotek') ? 1 : 0) : '',
      reference_number: `KAS-${String(30 + d).padStart(3, '0')}`,
    });
  }

  // ---- Tugas (±30): proses, rencana, terlambat, selesai
  const TASK_PLAN: [string, number, string, number, number][] = [
    // [judul, staf, status, tenggat (hari), proyek]
    ['Cek stok minyak goreng di rak A', 4, 'proses', 0, 1],
    ['Susun ulang rak B untuk mi instan', 5, 'proses', 1, 1],
    ['Rekap simpanan wajib bulan ini', 1, 'proses', 2, 2],
    ['Input kas penjualan gerai kemarin', 2, 'proses', 0, 2],
    ['Siapkan etalase gerai kopi', 8, 'proses', 3, 0],
    ['Hitung ulang obat di apotek', 7, 'proses', 1, 0],
    ['Layani pendaftaran anggota baru', 1, 'proses', 0, 2],
    ['Laporan bulanan ke pengawas', 0, 'proses', 4, 3],
    ['Perbarui label rak C1–C3', 4, 'rencana', 5, 1],
    ['Survei harga kopi petani', 8, 'rencana', 6, 0],
    ['Jadwalkan servis freezer C2', 5, 'rencana', 3, 1],
    ['Lengkapi berkas izin klinik', 9, 'rencana', 8, 3],
    ['Pelatihan kasir gerai kopi', 6, 'rencana', 7, 0],
    ['Buat SOP bongkar muat', 4, 'rencana', 10, 3],
    ['Kirim undangan RAT', 3, 'rencana', 12, 2],
    ['Cetak kartu anggota', 1, 'rencana', 4, 2],
    ['Tagih piutang simpan pinjam', 3, 'rencana', -2, 2],
    ['Perbaiki timbangan gerai', 6, 'rencana', -1, 0],
    ['Opname pupuk urea', 5, 'rencana', -3, 1],
    ['Unggah foto bukti kas', 2, 'rencana', -4, 2],
    ['Pasang papan nama gerai kopi', 8, 'selesai', -2, 0],
    ['Terima kiriman beras', 4, 'selesai', -1, 1],
    ['Rapikan arsip dokumen', 3, 'selesai', -5, 3],
    ['Rekap penjualan minggu lalu', 2, 'selesai', -3, 2],
    ['Bersihkan cold storage', 5, 'selesai', -6, 1],
    ['Daftarkan NIB', 0, 'selesai', -20, 3],
    ['Sosialisasi simpan pinjam', 1, 'selesai', -9, 2],
    ['Uji coba mesin kopi', 8, 'dibatalkan', -4, 0],
  ];
  for (const [i, [title, s, status, due, p]] of TASK_PLAN.entries())
    addRecord('work-items', {
      title,
      code: `TGS-${String(i + 1).padStart(3, '0')}`,
      description:
        i % 4 === 2
          ? [
              'Selesaikan sebelum akhir pekan.',
              'Koordinasi dulu dengan bendahara.',
              'Bawa nota pembelian ke kantor.',
            ][i % 3]
          : '',
      status,
      due_date: dayOffset(due),
      start_date: dayOffset(Math.min(due, 0) - g.int(1, 4)),
      completed_at: status === 'selesai' ? dayOffset(due) : '',
      assignee: staffMembers[s].nama,
      workstream_id: projectIds[p],
      milestone_id: i % 4 === 0 ? milestone[p] : '',
      sprint_id: status === 'proses' ? sprint : '',
      unit_id: p === 0 && s >= 6 ? activeUnitId(s === 7 ? 1 : 0) : '',
      issue_id: i === 17 ? issueIds[0] : '',
      document_id: i === 13 ? documentIds[4] : '',
      priority:
        due < 0 && status === 'rencana'
          ? 'tinggi'
          : g.pick(['normal', 'normal', 'rendah', 'tinggi'] as const),
      poac: g.pick(['planning', 'organizing', 'actuating', 'controlling'] as const),
      subtasks:
        i % 3 === 0
          ? [
              { title: 'Siapkan bahan', done: true },
              { title: 'Kerjakan', done: status === 'selesai' },
              { title: 'Laporkan', done: false },
            ]
          : [],
      // Rekan yang ikut memantau dan komentar contoh, agar kartu menampilkan tumpukan avatar seperti di aplikasi nyata.
      followers:
        i % 2 === 0
          ? staffMembers
              .filter((_, k) => k !== s)
              .slice(i % 5, (i % 5) + 1 + (i % 4))
              .map((x) => x.nama)
          : [],
      activities:
        i % 3 === 1
          ? ['Sudah saya cek, lanjut besok.', 'Perlu tanda tangan ketua dulu.'].map((text, k) => ({
              id: `komentar-${i}-${k}`,
              user: staffMembers[(s + k + 1) % staffMembers.length].nama,
              role: 'staf',
              text,
              created_at: `${dayOffset(-1)}T0${8 + k}:00:00+07:00`,
              type: 'comment' as const,
            }))
          : [],
    });

  // ---- Checklist kesiapan unit
  for (const [i, dim] of (['legalitas', 'fisik', 'sdm', 'sop', 'sistem'] as const).entries())
    for (const u of [2, 6])
      addRecord('checklist', {
        title: `${dim[0].toUpperCase()}${dim.slice(1)} ${UNIT_PLAN[u][0].toLowerCase()}`,
        unit_id: unitIds[u],
        workstream_id: projectIds[0],
        dimension: dim,
        status: u === 2 ? (i < 4 ? 'selesai' : 'proses') : i < 2 ? 'proses' : 'rencana',
      });

  // ---- Pelatihan dan jurnal kegiatan (satu jurnal hari ini terkait tugas → gym)
  for (const [i, s] of [6, 7, 1].entries())
    addRecord('trainings', {
      title: ['Pelatihan kasir', 'Penyimpanan obat', 'Layanan anggota'][i],
      staff_id: staffIds[s],
      date: dayOffset(i === 0 ? 0 : i === 2 ? -10 : 5 + i),
      status: i === 2 ? 'selesai' : 'rencana',
    });
  const taskId = (n: number) => sampleId('work-items', n);
  for (const [title, d, t] of [
    ['Senam pagi bersama tim', 0, 2],
    ['Kerja bakti gudang', -2, 0],
    ['Kunjungan petani kopi', -4, 10],
    ['Penyuluhan simpan pinjam', -9, 27],
    ['Cek suhu cold storage', -1, 0],
  ] as const)
    addRecord('journal', {
      title,
      code: `KGT-${String(-d + 1).padStart(3, '0')}`,
      date: dayOffset(d),
      notes: 'Catatan kegiatan contoh.',
      work_item_id: t ? taskId(t) : '',
      meeting_id: '',
    });

  // ---- Administrasi usaha (migrasi 10). Ditaruh paling akhir agar urutan acak data lama tetap.
  for (const [n, [title, category, outletIndex, value, condition, s]] of (
    [
      ['Freezer sembako 2 pintu', 'elektronik', 0, 6_500_000, 'baik', 6],
      ['Timbangan digital 150 kg', 'peralatan', 5, 1_800_000, 'perlu perbaikan', 4],
      ['Rak besi gudang (set 6)', 'furnitur', 5, 4_200_000, 'baik', 4],
      ['Laptop administrasi', 'elektronik', -1, 7_000_000, 'baik', 2],
      ['Motor roda tiga', 'kendaraan', 5, 28_000_000, 'baik', 5],
      ['Lemari pendingin obat', 'elektronik', 1, 5_400_000, 'rusak', 7],
    ] as const
  ).entries())
    addRecord('assets', {
      title,
      code: `AST-${String(n + 1).padStart(3, '0')}`,
      category,
      unit_id: outletIndex < 0 ? '' : activeUnitId(outletIndex),
      acquired_date: dayOffset(-g.int(60, 400)),
      value,
      condition,
      assignee: staffMembers[s].nama,
    });
  for (let d = -6; d <= 1; d++)
    for (const [i, id] of staffIds.entries()) {
      const status =
        d > 0
          ? 'terjadwal'
          : g.r() < 0.08
            ? g.pick(['izin', 'sakit'] as const)
            : g.r() < 0.1
              ? 'terlambat'
              : 'hadir';
      const [isIncome, leaveTime] = i < 4 ? ['07:30', '15:30'] : ['07:00', '16:00'];
      const present = status === 'hadir' || status === 'terlambat';
      addRecord('attendance', {
        title: staffMembers[i].nama,
        staff_id: id,
        date: dayOffset(d),
        status,
        shift: `${isIncome}-${leaveTime}`,
        check_in_time: present
          ? status === 'terlambat'
            ? isIncome.replace(/:\d\d$/, ':45')
            : isIncome
          : '',
        // Hari ini belum ada jam pulang.
        check_out_time: present && d < 0 ? leaveTime : '',
      });
    }
  const purchaseIds = [
    ['Beras dan minyak goreng', 1, -6, 'diterima', 'Beras 20 karung, minyak 10 dus', 9_800_000],
    ['Pupuk NPK musim tanam', 0, -1, 'dipesan', 'NPK 40 karung', 6_400_000],
    ['Gula dan tepung', 1, 0, 'draf', 'Gula 10 karung, tepung 8 karung', 0],
  ] as const;
  const purchaseId = purchaseIds.map(([title, m, d, status, items, total]) =>
    addRecord('purchase-orders', {
      title,
      stakeholder_id: partnerIds[m],
      date: dayOffset(d),
      expected_date: status === 'dipesan' ? dayOffset(2) : '',
      status,
      items,
      total,
      unit_id: activeUnitId(0),
      reference_number: `PO-${String(30 + d).padStart(3, '0')}`,
    }),
  );
  // Kiriman masuk pertama berasal dari pembelian yang sudah diterima.
  const incomingShipments = drafts.find(
    (b) => b.entity === 'deliveries' && b.data.direction === 'masuk',
  );
  if (incomingShipments) incomingShipments.data.purchase_id = purchaseId[0];
  for (let d = -13; d <= -1; d++)
    for (const outletIndex of [0, 1])
      addRecord('sales', {
        title: `Penjualan ${UNIT_PLAN[outletIndex][0]}`,
        unit_id: activeUnitId(outletIndex),
        date: dayOffset(d),
        amount: (outletIndex === 0 ? g.int(18, 40) : g.int(6, 18)) * 50_000,
        transactions: outletIndex === 0 ? g.int(35, 90) : g.int(10, 35),
      });
  for (const [i, id] of memberNames.slice(0, 12).entries()) {
    const memberNote = drafts.find((b) => b.data.__id === id)?.data;
    const memberName = String(memberNote?.title);
    // Simpanan tidak boleh tercatat sebelum tanggal bergabung.
    const joinDate = String(memberNote?.date);
    const joinOffset = Math.round((Date.parse(joinDate) - Date.parse(dayOffset(0))) / 86_400_000);
    const addSaving = (kind: string, direction: string, amount: number, d: number) =>
      addRecord('savings', {
        title: `Simpanan ${kind} · ${memberName}`,
        member_id: id,
        date: dayOffset(d),
        kind,
        direction,
        amount,
        reference_number: `SMP-${String((counters.get('savings') ?? 0) + 1).padStart(4, '0')}`,
      });
    addSaving('pokok', 'setor', 100_000, joinOffset);
    for (const d of [-60, -30, 0]) if (d >= joinOffset) addSaving('wajib', 'setor', 50_000, d);
    if (i % 3 === 0)
      addSaving('sukarela', 'setor', g.int(2, 10) * 50_000, Math.max(joinOffset, -g.int(5, 40)));
    if (i === 3) addSaving('sukarela', 'tarik', 50_000, 0);
  }

  // Agenda berjenis selain rapat (ditambah paling akhir agar nomor contoh lain tidak bergeser).
  addRecord('meetings', {
    title: 'Kunjungan gudang pemasok beras',
    jenis: 'kunjungan',
    date: dayOffset(0),
    time: '10:30',
    duration: 60,
    participants: `${staffMembers[0].nama}, ${staffMembers[8].nama}`,
    agenda: 'Cek mutu beras dan jadwal kirim bulan depan',
    mode: 'tatap muka',
    location: 'Gudang pemasok',
  });
  addRecord('meetings', {
    title: 'Sosialisasi simpanan anggota',
    jenis: 'acara',
    date: dayOffset(1),
    time: '16:00',
    duration: 90,
    participants: `${staffMembers[0].nama}, ${staffMembers[1].nama}`,
    agenda: 'Penjelasan simpanan pokok, wajib, dan sukarela',
    mode: 'tatap muka',
    location: 'Balai desa',
  });

  // ---- Rutin harian (migrasi 11): rutin standar manajer gerai; dua rutin pagi sudah dicentang hari ini.
  const routineIds = [
    ['07:30', 'Buka gerai & cek kas modal awal', [1, 2, 3, 4, 5, 6]],
    ['08:30', 'Briefing singkat petugas kasir/toko', [1, 2, 3, 4, 5, 6]],
    ['10:00', 'Cek persediaan barang rak & stok menipis', [1, 2, 3, 4, 5, 6, 7]],
    ['13:00', 'Rekapitulasi setoran anggota & kas tengah hari', [1, 2, 3, 4, 5, 6]],
    ['16:30', 'Tutup buku kas harian & hitung fisik uang kasir', [1, 2, 3, 4, 5, 6]],
    ['17:00', 'Cek keamanan, inventaris, dan kunci gerai', [1, 2, 3, 4, 5, 6, 7]],
    ['09:00', 'Rapat koordinasi mingguan pengurus', [1]],
  ] as const;
  const routineId = routineIds.map(([time, title, days]) =>
    addRecord('routines', { time, title, days: [...days], active: true }),
  );
  for (const id of routineId.slice(0, 2))
    addRecord('routine-checks', { routine_id: id, date: baseDate });

  // Validasi dengan skema yang sama dengan server: data contoh tidak boleh lolos tanpa aturan.
  return drafts.map(({ entity, data }, i) => {
    const { __id, ...fill } = data;
    const parsed = schemas[entity].parse(fill) as Record<string, unknown>;
    const createdAt = new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString();
    return { id: String(__id), entity, created_at: createdAt, updated_at: createdAt, data: parsed };
  });
}
