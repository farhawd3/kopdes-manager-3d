import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import postcss from 'postcss';

// AST menghitung elemen JSX sebenarnya, bukan contoh di komentar atau string.
const files = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name).replaceAll('\\', '/');
  return entry.isDirectory() ? files(file) : [file];
});
const sources = files('src');
const raw = [];
const stats = { button: 0, input: 0, select: 0, textarea: 0, date: 0, inline: 0, hexTsx: 0, hexCss: 0, important: 0, bytes: 0 };
const values = new Map(['border-radius', 'font-size', 'height'].map((name) => [name, new Set()]));
const duplicates = [];
const cssRows = [];
for (const file of sources) {
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.tsx')) {
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    stats.hexTsx += (text.match(/#[\da-f]{3,8}\b/gi) || []).length;
    const visit = (node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(source);
        if (['button', 'input', 'select', 'textarea'].includes(tag)) {
          stats[tag]++;
          raw.push({ file, line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, tag, ui: file.includes('/components/ui/') });
        }
        for (const attr of node.attributes.properties) {
          if (!ts.isJsxAttribute(attr)) continue;
          if (attr.name.getText(source) === 'style') stats.inline++;
          if (attr.name.getText(source) === 'type' && attr.initializer && ts.isStringLiteral(attr.initializer) && attr.initializer.text === 'date') stats.date++;
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  if (file.endsWith('.css')) {
    const ast = postcss.parse(text, { from: file });
    const selectors = new Map();
    let important = 0;
    stats.bytes += Buffer.byteLength(text);
    ast.walkDecls((decl) => {
      if (decl.important) important++;
      stats.hexCss += (decl.value.match(/#[\da-f]{3,8}\b/gi) || []).length;
      values.get(decl.prop)?.add(decl.value);
    });
    ast.walkRules((rule) => {
      const context = [];
      for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) {
        if (parent.type === 'atrule') context.unshift(`@${parent.name} ${parent.params}`);
      }
      for (const selector of rule.selectors) {
        const key = [...context, selector].join(' → ');
        selectors.set(key, [...(selectors.get(key) || []), rule.source.start.line]);
      }
    });
    stats.important += important;
    cssRows.push(`| ${file} | ${Buffer.byteLength(text)} | ${important} |`);
    for (const [selector, lines] of selectors) if (lines.length > 1) duplicates.push(`| ${file} | ${selector.replaceAll('|', '\\|')} | ${lines.join(', ')} |`);
  }
}
const routes = sources.filter((file) => /\/page\.tsx$/.test(file));
const overlays = sources.filter((file) => /(?:Modal|Drawer|Search|AppShell)\.tsx$/.test(file));
const lines = [
  '# Audit UI — kode aktual', '',
  'Dibuat ulang dengan `npm run audit:ui`. Duplikat dihitung dalam konteks media/at-rule yang sama; bukan bukti aman untuk menghapus CSS. Angka mencakup seluruh src, termasuk pustaka UI.', '',
  '## Metrik', '', '| Metrik | Jumlah |', '|---|---:|',
  ...Object.entries(stats).map(([key, value]) => `| ${key} | ${value} |`),
  `| Elemen mentah di luar components/ui | ${raw.filter((row) => !row.ui).length} |`,
  `| Selector berulang | ${duplicates.length} |`,
  ...[...values].map(([name, set]) => `| Nilai ${name} unik | ${set.size} |`), '',
  '## CSS', '', '| Berkas | Byte | !important |', '|---|---:|---:|', ...cssRows, '',
  '## Inventaris halaman dan overlay', '', ...[...routes, ...overlays].map((file) => `- ${file}`), '',
  '## Seluruh kontrol mentah', '', '| Komponen | File:baris | Varian saat ini | Masalah | Pengganti | Status |', '|---|---|---|---|---|---|',
  ...raw.map(({ file, line, tag, ui }) => `| ${tag} | ${file}:${line} | HTML ${tag} | ${ui ? 'Primitive internal' : 'Gaya tersebar; tinjau perilaku'} | ${{ button: 'Button / IconButton', input: 'Input / DateInput', select: 'Select', textarea: 'Textarea' }[tag]} | ${ui ? 'Pustaka UI' : 'Belum dimigrasi'} |`), '',
  '## Selector berulang', '', '| Berkas | Selector dan konteks | Baris |', '|---|---|---|', ...duplicates, '',
  '## Nilai deklarasi', '', ...[...values].flatMap(([name, set]) => [`### ${name}`, '', ...[...set].sort().map((value) => `- \`${value}\``), '']),
];
fs.writeFileSync('docs/arsip/AUDIT.md', lines.join('\n'));
console.log(JSON.stringify({ ...stats, rawOutsideUi: raw.filter((row) => !row.ui).length, duplicateSelectors: duplicates.length }, null, 2));
if (process.argv.includes('--check') && raw.some((row) => !row.ui)) {
  console.error('Kontrol HTML mentah di luar components/ui tidak diizinkan.');
  process.exitCode = 1;
}
