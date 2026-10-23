/** Garis lengkung tipis di pojok kanan atas kartu; satu-satunya hiasan kartu, sengaja sangat halus. */
export function Wave() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 90"
      className="pointer-events-none absolute -top-2 -right-2 h-24 w-40 text-white opacity-60 dark:opacity-10"
      fill="none"
    >
      <path d="M8 -4 C 40 60, 110 20, 168 74" stroke="currentColor" strokeWidth="1.6" />
      <path d="M40 -6 C 70 40, 120 14, 170 46" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
