'use client';
import { useState } from 'react';
import { CalendarDays, ListChecks, LockKeyhole, Package, Wallet } from 'lucide-react';
import { api, resetAuthNavigation } from '@/lib/client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Field, Input } from '@/components/ui/field';
import { Wave } from '@/components/ui/wave';
import { useTheme } from '@/lib/theme';

const FEATURES = [
  { label: 'Tugas & proyek', icon: ListChecks, tone: 'lavender' },
  { label: 'Agenda rapat', icon: CalendarDays, tone: 'sky' },
  { label: 'Buku kas', icon: Wallet, tone: 'mint' },
  { label: 'Barang & stok', icon: Package, tone: 'peach' },
] as const;

export default function PinPage() {
  useTheme();
  const [setup, setSetup] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <main className="grid min-h-dvh bg-canvas lg:grid-cols-[1fr_1.1fr]">
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Logo />
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Masuk ruang kerja</h1>
          <p className="mt-2 text-ink-3">Ruang kerja manajer koperasi. Masukkan PIN untuk melanjutkan.</p>
          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setMessage('');
              const form = new FormData(event.currentTarget);
              try {
                await api('auth/pin', {
                  action: setup ? 'setup' : 'login',
                  pin: form.get('pin'),
                  ...(setup ? { setupToken: form.get('token') } : {}),
                });
                if (setup) {
                  setSetup(false);
                  setMessage('PIN awal tersimpan. Silakan masuk.');
                } else resetAuthNavigation('/home');
              } catch (error) {
                setMessage((error as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label={setup ? 'PIN baru' : 'PIN'} hint="Minimal 6 digit. Sesi berlaku 12 jam.">
              <Input name="pin" type="password" inputMode="numeric" pattern="[0-9]{6,12}" minLength={6} maxLength={12} autoComplete={setup ? 'new-password' : 'current-password'} required autoFocus className="tabular h-13 text-lg tracking-[0.3em]" />
            </Field>
            {setup && (
              <Field label="Token pengaturan awal" hint="Dari HUB_SETUP_TOKEN di server.">
                <Input name="token" type="password" minLength={32} required autoComplete="off" />
              </Field>
            )}
            <Button variant="primary" type="submit" busy={busy} className="h-12">
              <LockKeyhole />
              {setup ? 'Simpan PIN awal' : 'Buka ruang kerja'}
            </Button>
            {message && (
              <p role="alert" className="rounded-2xl bg-surface-3 p-3 text-sm font-semibold text-ink-2">
                {message}
              </p>
            )}
          </form>
          <button type="button" onClick={() => { setSetup(!setup); setMessage(''); }} className="mt-4 text-sm font-semibold text-accent-ink hover:underline">
            {setup ? 'Kembali ke masuk' : 'Pengaturan PIN pertama kali'}
          </button>
        </div>
      </section>
      <section aria-hidden="true" className="relative hidden overflow-hidden bg-surface p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="grid max-w-lg grid-cols-2 gap-4 self-center">
          {FEATURES.map((feature, index) => (
            <div key={feature.label} data-tone={feature.tone} className={`relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-tone p-6 text-tone-ink ${index % 2 ? 'translate-y-8' : ''}`}>
              <Wave />
              <feature.icon className="relative size-8" />
              <span className="relative text-xl font-extrabold">{feature.label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
