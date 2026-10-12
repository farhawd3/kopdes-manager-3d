// Sistem gaya src/styles: warna mentah hanya di token.css (dan lembar cetak laporan), tanpa !important
// kecuali pengaman reduced-motion dan cetak.
const config = {
  rules: {
    'color-no-hex': true,
    'declaration-no-important': true,
  },
  overrides: [
    { files: ['src/styles/token.css'], rules: { 'color-no-hex': null } },
    { files: ['src/styles/halaman/laporan.css'], rules: { 'color-no-hex': null, 'declaration-no-important': null } },
    { files: ['src/styles/dasar.css'], rules: { 'declaration-no-important': null } },
  ],
};

export default config;
