import { useId } from 'react';

/**
 * Lipatan timbul di kanan atas kartu, seperti kartu TaskTrack: dua bidang V yang sedikit lebih
 * terang dengan bayangan lembut di tepinya, tanpa garis keras. Satu-satunya hiasan kartu; warna
 * bayangan mengikuti nada kartu (`--tone-bar`).
 */
export function Wave() {
  const id = useId();
  const shadow = (name: string, blur: number, opacity: number) => (
    <filter id={`${id}-${name}`} x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow
        dx="0"
        dy={blur * 0.7}
        stdDeviation={blur}
        style={{ floodColor: 'var(--tone-bar, #000)', floodOpacity: opacity }}
      />
    </filter>
  );
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 125"
      preserveAspectRatio="xMaxYMin meet"
      className="pointer-events-none absolute top-0 right-0 h-[8rem] w-[13rem] text-white dark:opacity-20"
    >
      <defs>
        {shadow('outer', 5, 0.16)}
        {shadow('inner', 4, 0.22)}
      </defs>
      <path
        d="M44 -12 L116 72 C132 92 150 92 166 76 L215 32 V-12 Z"
        fill="currentColor"
        fillOpacity="0.2"
        filter={`url(#${id}-outer)`}
      />
      <path
        d="M72 -12 L124 50 C136 64 150 64 162 53 L215 6 V-12 Z"
        fill="currentColor"
        fillOpacity="0.38"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="0.8"
        filter={`url(#${id}-inner)`}
      />
    </svg>
  );
}
