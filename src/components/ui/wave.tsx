/**
 * Lipatan lengkung di kanan atas kartu, seperti kartu TaskTrack: bidang V yang sedikit lebih terang
 * dengan tepi lembut. Satu-satunya hiasan kartu; warna mengikuti nada kartu lewat putih transparan.
 */
export function Wave() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 120"
      preserveAspectRatio="xMaxYMin meet"
      className="pointer-events-none absolute top-0 right-0 h-[7.5rem] w-[12.5rem] text-white dark:opacity-15"
      fill="none"
    >
      <path d="M58 0 L122 70 Q134 83 148 71 L200 24 V0 Z" fill="currentColor" fillOpacity="0.4" />
      <path d="M58 0 L122 70 Q134 83 148 71 L200 24" stroke="currentColor" strokeOpacity="0.75" strokeWidth="1.4" />
      <path d="M34 0 L116 90 Q133 107 152 91 L200 48" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" />
    </svg>
  );
}
