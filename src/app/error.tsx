'use client';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center p-6">
      <section role="alert" className="max-w-sm rounded-3xl bg-surface p-8 text-center shadow-card">
        <h1 className="text-xl font-bold">Halaman belum dapat dibuka</h1>
        <p className="mt-1 text-sm text-ink-3">
          Terjadi gangguan. Data belum ditampilkan, tidak ada yang berubah.
        </p>
        <Button variant="primary" className="mt-5" onClick={reset}>
          Coba lagi
        </Button>
      </section>
    </div>
  );
}
