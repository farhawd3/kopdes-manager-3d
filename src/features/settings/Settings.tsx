'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';
import { api, resetAuthNavigation } from '@/lib/client';
import { useTheme } from '@/lib/ThemeContext';
import { Ikon3D } from '@/components/ui/Ikon3D';
import { usePreference } from '@/lib/usePreference';
import {
  Palette,
  ShieldCheck,
  Database,
  Building,
  RotateCcw,
  Download,
  Upload,
  KeyRound,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { PemilihTampilan } from '@/components/ui/PemilihTampilan';
import type { Item } from '@/features/records/schemas';

export function Settings({ refresh, preferenceScope = '', organization }: { refresh: () => Promise<void>; preferenceScope?: string; organization?: Item }) {
  const { setTheme, setAccent } = useTheme();
  const [activeTab, setActiveTab] = useState<'tampilan' | 'profil' | 'keamanan' | 'cadangan'>('tampilan');
  const [density, setDensity] = usePreference(preferenceScope + 'hub-density', 'comfortable');
  const [motion, setMotion] = usePreference(preferenceScope + 'hub-motion', 'system');
  const [navStyle, setNavStyle] = usePreference(preferenceScope + 'hub-nav-style', 'soft');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setMessage('');
    try {
      await action();
      setMessage(success);
      await refresh();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="section-head records-head settings-page-head">
        <div>
          <h2>
            <Ikon3D kind="gerigi" size={30} />
            Pengaturan
          </h2>
          <p>Tampilan, profil koperasi, PIN, dan cadangan data.</p>
        </div>
      </div>

      {/* ── Settings Subnavigation Tabs ─────────────────────────── */}
      <div className="settings-tabs-row" role="tablist" aria-label="Kategori Pengaturan">
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tampilan'}
          className={`settings-tab-btn ${activeTab === 'tampilan' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('tampilan')}
        >
          <Palette size={16} />
          <span>Tampilan</span>
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === 'profil'}
          className={`settings-tab-btn ${activeTab === 'profil' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('profil')}
        >
          <Building size={16} />
          <span>Profil koperasi</span>
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === 'keamanan'}
          className={`settings-tab-btn ${activeTab === 'keamanan' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('keamanan')}
        >
          <ShieldCheck size={16} />
          <span>Keamanan PIN</span>
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === 'cadangan'}
          className={`settings-tab-btn ${activeTab === 'cadangan' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('cadangan')}
        >
          <Database size={16} />
          <span>Cadangan data</span>
        </Button>
      </div>

      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}

      {/* ── TAB 1: TAMPILAN & TEMA ───────────────────────────────── */}
      {activeTab === 'tampilan' && (
        <div className="settings-content-grid">
          <section className="card tampilan-settings">
            <div className="section-head">
              <div>
                <h2>
                  <Palette size={18} aria-hidden="true" />
                  Warna & tema
                </h2>
                <p>Lima warna aksen dan tema terang/gelap. Pilihan tersimpan di peramban ini.</p>
              </div>
            </div>
            <PemilihTampilan pratinjau />
          </section>

          <section className="card appearance-settings">
            <h2>Tata letak</h2>
            <p>Kerapatan tabel, animasi, dan gaya menu samping.</p>

            <div className="settings-fields-grid">
              <label className="field-group">
                <span className="field-caption">Kerapatan isi</span>
                <Select
                  value={density}
                  onChange={setDensity}
                  options={[
                    { value: 'comfortable', label: 'Nyaman (bawaan)' },
                    { value: 'compact', label: 'Ringkas untuk tabel desktop' },
                  ]}
                  ariaLabel="Kerapatan isi"
                />
              </label>

              <label className="field-group">
                <span className="field-caption">Animasi</span>
                <Select
                  value={motion}
                  onChange={setMotion}
                  options={[
                    { value: 'system', label: 'Ikuti perangkat' },
                    { value: 'minimal', label: 'Minimal' },
                  ]}
                  ariaLabel="Animasi layar"
                />
              </label>

              <label className="field-group">
                <span className="field-caption">Menu samping</span>
                <Select
                  value={navStyle}
                  onChange={setNavStyle}
                  options={[
                    { value: 'soft', label: 'Terang' },
                    { value: 'ink', label: 'Arang gelap' },
                  ]}
                  ariaLabel="Gaya menu samping"
                />
              </label>
            </div>

            <div className="settings-reset-row">
              <Button
                type="button"
                className="btn-reset-appearance"
                onClick={() => {
                  setTheme('light');
                  setAccent('ungu');
                  setDensity('comfortable');
                  setMotion('system');
                  setNavStyle('soft');
                  setMessage('Tampilan berhasil dikembalikan ke pengaturan awal.');
                }}
              >
                <RotateCcw size={15} />
                <span>Kembalikan tampilan awal</span>
              </Button>
            </div>
          </section>
        </div>
      )}

      {/* ── TAB 2: PROFIL KOPERASI ──────────────────────────────── */}
      {activeTab === 'profil' && (
        <div className="settings-content-grid settings-panel-single">
          <section className="card">
            <span className="eyebrow">IDENTITAS OPERASIONAL</span>
            <h2>Profil Manajer & Koperasi</h2>
            <p>Data identitas resmi yang dicantumkan pada kop surat, laporan kerja, dan berkas koordinasi.</p>

            <div className="profile-identity-card">
              <div className="profile-avatar-circle">
                <span>KD</span>
              </div>
              <div className="profile-details">
                <h3>{String(organization?.data.title || 'Profil koperasi belum diisi')}</h3>
                <p>{organization?.data.manager ? `Manajer: ${String(organization.data.manager)}` : 'Lengkapi identitas melalui formulir profil koperasi.'}</p>
                <small>{['village', 'district', 'regency', 'province'].map((field) => organization?.data[field]).filter(Boolean).join(', ')}</small>
              </div>
            </div>

            <div className="profile-actions-strip">
              <Link className="button primary" href="/pengaturan?bagian=organization">
                Perbarui Data Profil Koperasi
              </Link>
              <Link className="button" href="/laporan">
                Pratinjau Lembar Kop Laporan Resmi ↗
              </Link>
            </div>
          </section>
        </div>
      )}

      {/* ── TAB 3: KEAMANAN PIN ─────────────────────────────────── */}
      {activeTab === 'keamanan' && (
        <div className="settings-content-grid settings-panel-single">
          <section className="card security-settings-card">
            <div className="section-head-with-icon">
              <KeyRound size={20} className="text-brand" />
              <div>
                <h2>Ubah PIN Masuk</h2>
                <p>PIN digunakan untuk mengamankan ruang kerja pribadi manajer di perangkat ini.</p>
              </div>
            </div>

            <form
              className="security-pin-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void run(async () => {
                  await api('auth/pin', {
                    action: 'change',
                    pin: form.get('pin'),
                    newPin: form.get('newPin'),
                  });
                  resetAuthNavigation('/pin');
                }, 'PIN berhasil diubah. Silakan masuk kembali dengan PIN baru.');
              }}
            >
              <label className="field-group">
                <span className="field-caption">PIN Saat Ini</span>
                <Input
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{6,12}"
                  placeholder="Masukkan 6-12 digit PIN lama"
                  required
                  autoComplete="current-password"
                  className="text-input"
                />
              </label>

              <label className="field-group">
                <span className="field-caption">PIN Baru</span>
                <Input
                  name="newPin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{6,12}"
                  placeholder="Masukkan 6-12 digit PIN baru"
                  required
                  autoComplete="new-password"
                  className="text-input"
                />
              </label>

              <div className="form-actions">
                <Button disabled={busy} type="submit" className="primary">
                  {busy ? 'Menyimpan PIN…' : 'Simpan PIN Baru'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ── TAB 4: CADANGAN & PEMULIHAN ─────────────────────────── */}
      {activeTab === 'cadangan' && (
        <div className="settings-content-grid settings-panel-single">
          <section className="card backup-settings-card">
            <h2>Cadangan Data Mandiri</h2>
            <p>
              Simpan salinan data kerja sebagai berkas JSON di perangkat Anda. Berkas tidak dienkripsi; simpan
              di tempat aman. Unduh berkala agar proyek, buku kas, anggota, dan rapat bisa dipulihkan.
            </p>

            <div className="backup-action-boxes">
              <div className="backup-box">
                <div className="box-head">
                  <Download size={18} />
                  <strong>Unduh Cadangan</strong>
                </div>
                <p>Mengunduh semua catatan ruang kerja dan snapshot laporan.</p>
                <a className="button primary" href="/api/backup" download>
                  Unduh Berkas JSON (.json)
                </a>
              </div>

              <div className="backup-box restore-box">
                <div className="box-head">
                  <Upload size={18} />
                  <strong>Pulihkan Data Cadangan</strong>
                </div>
                <p>Memulihkan seluruh catatan dari berkas JSON hasil unduhan sebelumnya.</p>
                <label className="button restore-upload-label">
                  Pilih Berkas Cadangan JSON
                  <Input
                    type="file"
                    accept=".json,application/json"
                    disabled={busy}
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5_000_000) {
                        setMessage('Berkas maksimal 5 MB.');
                        return;
                      }
                      if (
                        !confirm(
                          'PERINGATAN: Pemulihan akan menggantikan seluruh catatan kerja saat ini dengan data dari cadangan. Lanjutkan?',
                        )
                      )
                        return;
                      void run(
                        async () => api('backup', JSON.parse(await file.text())),
                        'Data ruang kerja berhasil dipulihkan secara penuh.',
                      );
                    }}
                  />
                </label>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
