'use client';
import { useRef, useState } from 'react';
import { Check, Download, LockKeyhole, Moon, Pencil, Sun, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '@/features/workspace/use-workspace';
import { RecordFormSheet } from '@/features/records/lazy';
import { PageLoading } from '@/features/records/records-page';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { ErrorState } from '@/components/ui/states';
import { useConfirm } from '@/components/ui/confirm';
import { Wave } from '@/components/ui/wave';
import { ACCENTS, useTheme } from '@/lib/theme';
import { api, resetAuthNavigation } from '@/lib/client';
import { formatDate } from '@/lib/date';

const CARD = 'flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-card md:p-6';

export function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const { data, loading, error, refresh } = useWorkspace('settings');
  const [editing, setEditing] = useState(false);
  const organization = data.organization?.[0];
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Pengaturan"
        actions={<Tabs label="Bagian pengaturan" value={tab} onChange={setTab} items={[{ id: 'profile', label: 'Profil koperasi' }, { id: 'look', label: 'Tampilan' }, { id: 'pin', label: 'Keamanan PIN' }, { id: 'backup', label: 'Cadangan data' }]} />}
      />
      {error ? (
        <ErrorState message={error} onRetry={() => void refresh()} />
      ) : loading ? (
        <PageLoading />
      ) : tab === 'profile' ? (
        <section data-tone="sky" className="relative overflow-hidden rounded-[1.75rem] bg-tone p-6 text-tone-ink md:p-8">
          <Wave />
          <div className="relative flex flex-wrap items-start gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold">Profil koperasi</p>
              <h2 className="text-2xl font-extrabold text-ink">{organization ? String(organization.data.title) : 'Belum diisi'}</h2>
              {organization && (
                <p className="mt-1 text-sm">
                  {[organization.data.village, organization.data.district, organization.data.regency, organization.data.province].filter(Boolean).map(String).join(', ') || 'Alamat belum diisi'}
                </p>
              )}
            </div>
            <Button className="bg-surface/85" onClick={() => setEditing(true)}>
              <Pencil />
              {organization ? 'Ubah profil' : 'Isi profil'}
            </Button>
          </div>
          {organization && (
            <dl className="relative mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Manajer', String(organization.data.manager || 'Belum diisi')],
                ['Mulai bekerja', formatDate(String(organization.data.start_date || ''))],
                ['Target pembukaan', formatDate(String(organization.data.target_date || ''))],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-surface/70 px-4 py-3">
                  <dt className="text-xs font-bold opacity-80">{label}</dt>
                  <dd className="font-bold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="relative mt-4 text-sm">Nama manajer dipakai di sapaan Beranda, laporan, dan pilihan penanggung jawab.</p>
        </section>
      ) : tab === 'look' ? (
        <Appearance />
      ) : tab === 'pin' ? (
        <ChangePin />
      ) : (
        <Backup refresh={refresh} />
      )}
      <RecordFormSheet open={editing} entity="organization" item={organization} workspace={data} refresh={refresh} onClose={() => setEditing(false)} />
    </div>
  );
}

function Appearance() {
  const { theme, setTheme, accent, setAccent } = useTheme();
  return (
    <section className={CARD}>
      <div>
        <h2 className="text-lg font-extrabold">Tema</h2>
        <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map((value) => (
            <button key={value} type="button" aria-pressed={theme === value} onClick={() => setTheme(value)} className="flex items-center gap-3 rounded-2xl border-2 border-line p-4 text-left font-bold transition aria-pressed:border-accent-strong aria-pressed:bg-accent">
              {value === 'light' ? <Sun className="size-5" /> : <Moon className="size-5" />}
              {value === 'light' ? 'Terang' : 'Gelap'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-extrabold">Warna sorotan</h2>
        <p className="text-sm text-ink-3">Dipakai untuk menu aktif, tab, hari terpilih, dan fokus. Warna kartu tetap mengikuti proyek.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {ACCENTS.map((option) => (
            <button key={option.id} type="button" aria-pressed={accent === option.id} onClick={() => setAccent(option.id)} className="flex flex-col items-center gap-2 rounded-2xl p-2 text-sm font-semibold text-ink-2 aria-pressed:text-ink">
              <span className="grid size-12 place-items-center rounded-full text-white ring-offset-2 ring-offset-surface" style={{ background: option.swatch, boxShadow: accent === option.id ? `0 0 0 3px var(--surface), 0 0 0 5px ${option.swatch}` : undefined }}>
                {accent === option.id && <Check className="size-5" strokeWidth={3} />}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-ink-3">Pilihan tampilan disimpan di peramban ini.</p>
    </section>
  );
}

function ChangePin() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <form
      className={`${CARD} max-w-lg`}
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setBusy(true);
        setMessage('');
        try {
          await api('auth/pin', { action: 'change', pin: form.get('pin'), newPin: form.get('newPin') });
          toast.success('PIN diganti. Silakan masuk lagi.');
          resetAuthNavigation('/pin');
        } catch (error) {
          setMessage((error as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="text-lg font-extrabold">Ganti PIN</h2>
      <Field label="PIN sekarang">
        <Input name="pin" type="password" inputMode="numeric" pattern="[0-9]{6,12}" required autoComplete="current-password" />
      </Field>
      <Field label="PIN baru" hint="6–12 digit angka.">
        <Input name="newPin" type="password" inputMode="numeric" pattern="[0-9]{6,12}" required autoComplete="new-password" />
      </Field>
      {message && <p role="alert" className="rounded-2xl bg-late p-3 text-sm font-semibold text-late-ink">{message}</p>}
      <Button type="submit" variant="primary" busy={busy}>
        <LockKeyhole />
        Simpan PIN baru
      </Button>
    </form>
  );
}

function Backup({ refresh }: { refresh: () => Promise<void> | void }) {
  const confirm = useConfirm();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <section className={`${CARD} max-w-2xl`}>
      <h2 className="text-lg font-extrabold">Cadangan data</h2>
      <p className="text-sm text-ink-2">Unduh semua catatan dan laporan sebagai berkas JSON. Berkas tidak dienkripsi; simpan di tempat aman.</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="primary">
          <a href="/api/backup" download>
            <Download />
            Unduh cadangan
          </a>
        </Button>
        <Button busy={busy} onClick={() => input.current?.click()}>
          <Upload />
          Pulihkan dari berkas
        </Button>
      </div>
      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) return toast.error('Berkas cadangan maksimal 5 MB.');
          if (!(await confirm({ title: 'Pulihkan data dari cadangan?', description: 'Semua catatan yang ada sekarang akan diganti isi berkas ini. Tindakan ini tidak dapat diurungkan.', confirmLabel: 'Pulihkan', danger: true }))) return;
          setBusy(true);
          try {
            await api('backup', JSON.parse(await file.text()));
            toast.success('Data ruang kerja berhasil dipulihkan secara penuh.');
            await refresh();
          } catch (error) {
            toast.error(error instanceof SyntaxError ? 'Berkas bukan cadangan JSON yang sah.' : (error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
      <p className="text-xs text-ink-3">Pemulihan dibatalkan seluruhnya bila ada data yang tidak sah; data sebelumnya tetap tersimpan.</p>
    </section>
  );
}
