import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Hanya membaca: kandidat harus diperiksa manual, bukan langsung dihapus.
const root = process.cwd();
const configPath = ts.findConfigFile(root, ts.sys.fileExists);
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const { options, fileNames } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const normalize = (file) => path.resolve(file).replaceAll('\\', '/');
const sources = fileNames.map(normalize).filter((file) => file.includes('/src/') && /\.tsx?$/.test(file));
const known = new Set(sources);
const edges = new Map();
for (const file of sources) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const imports = [];
  const visit = (node) => {
    const specifier = ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
      ? node.moduleSpecifier
      : ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(source) === 'require')
        ? node.arguments[0] : undefined;
    if (specifier && ts.isStringLiteral(specifier)) {
      const resolved = ts.resolveModuleName(specifier.text, file, options, ts.sys).resolvedModule;
      if (resolved) imports.push(normalize(resolved.resolvedFileName));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  edges.set(file, imports.filter((dependency) => known.has(dependency)));
}
const entry = /\/(?:page|layout|route|loading|error|global-error|not-found|template|default|middleware|instrumentation|sitemap|robots)\.tsx?$/;
const reachable = new Set();
const walk = (file) => {
  if (reachable.has(file)) return;
  reachable.add(file);
  for (const dependency of edges.get(file) ?? []) walk(dependency);
};
sources.filter((file) => entry.test(file) || file.endsWith('.d.ts')).forEach(walk);
const candidates = sources.filter((file) => !reachable.has(file));
console.log(`${sources.length} berkas sumber · ${reachable.size} terjangkau dari titik masuk Next.js`);
console.log('Kandidat saja — periksa tes, konvensi Next, dan pemakaian luar sebelum menghapus:');
for (const file of candidates) console.log(path.relative(root, file));
