'use client';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { api, resetAuthNavigation } from '@/lib/client';
import { Button } from '@/components/ui/Button';
import { Ikon3D } from '@/components/ui/Ikon3D';
export default function PinPage() {
  const [setup, setSetup] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <main className="auth pin-page">
      <div className="card">
        <div className="pin-emblem"><Ikon3D kind="kantor" size={72} /></div>
        <span className="eyebrow">Dunia Koperasi</span>
        <h1>Ruang kerja manajer</h1>
        <p>Masuk untuk membuka dunia 3D dan mengelola pekerjaan koperasi.</p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            const form = new FormData(event.currentTarget);
            try {
              await api('auth/pin', {
                action: setup ? 'setup' : 'login',
                pin: form.get('pin'),
                ...(setup ? { setupToken: form.get('token') } : {}),
              });
              if (setup) {
                setSetup(false);
                setError('PIN awal tersimpan. Silakan masuk.');
              } else resetAuthNavigation('/beranda');
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            PIN {setup ? 'baru' : ''}
            <Input
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{6,12}"
              minLength={6}
              maxLength={12}
              autoComplete={setup ? 'new-password' : 'current-password'}
              required
            />
          </label>
          {setup && (
            <label>
              Token pengaturan awal
              <Input name="token" type="password" minLength={32} required autoComplete="off" />
              <small>Dari HUB_SETUP_TOKEN pada server.</small>
            </label>
          )}
          <Button primary busy={busy}>
            {busy ? 'Memproses…' : setup ? 'Simpan PIN awal' : 'Buka ruang kerja'}
          </Button>
          {error && <p role="alert">{error}</p>}
        </form>
        <Button
          onClick={() => {
            setSetup(!setup);
            setError('');
          }}
        >
          {setup ? 'Kembali ke masuk' : 'Pengaturan PIN pertama kali'}
        </Button>
        <small>PIN minimal 6 digit. Sesi berlaku 12 jam.</small>
      </div>
    </main>
  );
}
