'use client';
import { useId, useRef } from 'react';
import { Check, Moon, Sun } from 'lucide-react';
import { AKSEN } from '@/lib/tampilan';
import type { Aksen } from '@/lib/tampilan';
import { useTheme } from '@/lib/ThemeContext';

type Props = {
  /** Versi rapat untuk menu profil. */
  ringkas?: boolean;
  /** Pratinjau kecil di Pengaturan. */
  pratinjau?: boolean;
};

/**
 * Pemilih lima aksen dan tema terang/gelap. Panah kiri/kanan berpindah aksen
 * seperti radiogroup; pilihan disimpan di peramban oleh ThemeProvider.
 */
export function PemilihTampilan({ ringkas = false, pratinjau = false }: Props) {
  const { accent, setAccent, preference, setTheme } = useTheme();
  const id = useId();
  const tombol = useRef<Array<HTMLButtonElement | null>>([]);
  const judulAksen = `${id}-aksen`;
  const judulTema = `${id}-tema`;

  const pilih = (aksen: Aksen, indeks: number) => {
    setAccent(aksen);
    tombol.current[indeks]?.focus();
  };

  const pindah = (indeks: number, arah: number) => {
    const berikut = (indeks + arah + AKSEN.length) % AKSEN.length;
    pilih(AKSEN[berikut].id, berikut);
  };

  return (
    <div className={`pemilih-tampilan${ringkas ? ' pemilih-tampilan-profil' : ''}`}>
      <div className="pemilih-tampilan-blok">
        <h3 className="pemilih-tampilan-judul" id={judulAksen}>
          Warna aksen
        </h3>
        <div className="swatch-baris" role="radiogroup" aria-labelledby={judulAksen}>
          {AKSEN.map((aksen, indeks) => {
            const aktif = accent === aksen.id;
            return (
              <button
                key={aksen.id}
                ref={(el) => {
                  tombol.current[indeks] = el;
                }}
                type="button"
                role="radio"
                aria-checked={aktif}
                tabIndex={aktif ? 0 : -1}
                data-aksen-pilihan={aksen.id}
                className="pilihan-aksen"
                onClick={() => setAccent(aksen.id)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    event.preventDefault();
                    pindah(indeks, 1);
                  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    pindah(indeks, -1);
                  } else if (event.key === 'Home') {
                    event.preventDefault();
                    pilih(AKSEN[0].id, 0);
                  } else if (event.key === 'End') {
                    event.preventDefault();
                    pilih(AKSEN[AKSEN.length - 1].id, AKSEN.length - 1);
                  }
                }}
              >
                <span className="pilihan-aksen-bulat" aria-hidden="true">
                  {aktif && <Check size={15} strokeWidth={3} />}
                </span>
                <span>{aksen.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pemilih-tampilan-blok">
        <h3 className="pemilih-tampilan-judul" id={judulTema}>
          Tema
        </h3>
        <div className="pemilih-tema" role="group" aria-labelledby={judulTema}>
          <button type="button" aria-pressed={preference === 'light'} onClick={() => setTheme('light')}>
            <Sun size={15} aria-hidden="true" />
            Terang
          </button>
          <button type="button" aria-pressed={preference === 'dark'} onClick={() => setTheme('dark')}>
            <Moon size={15} aria-hidden="true" />
            Gelap
          </button>
        </div>
      </div>

      {pratinjau && (
        <div className="pratinjau-tampilan" aria-hidden="true">
          <span className="pratinjau-sisi">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="pratinjau-isi">
            <i />
            <span className="pratinjau-kartu">
              <i />
              <i />
              <i />
            </span>
            <i />
            <span className="pratinjau-tombol" />
          </span>
        </div>
      )}
    </div>
  );
}
