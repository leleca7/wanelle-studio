#!/usr/bin/env node
'use strict';

// Emergency public-output allow-by-copy build. Source files remain in Git.
// Only the five confirmed commercial documents are excluded from the deployed artifact.
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const output = path.join(root, 'public');
const excluded = new Set([
  'assets/market-prices.json',
  'assets/market-prices.js',
  'PESQUISA_DE_PRECOS.md',
  'CUSTOS_DE_PRODUCAO_2026.md',
  'neon/cotacoes_ifood_2026-10-14.json',
]);
const excludedDirs = new Set(['.git', '.vercel', 'node_modules', 'public']);

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

function copyTree(sourceDir, relativeDir = '') {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const rel = path.posix.join(relativeDir, entry.name);
    if (excludedDirs.has(entry.name) && relativeDir === '') continue;
    if (excluded.has(rel)) continue;

    const source = path.join(sourceDir, entry.name);
    const destination = path.join(output, rel);
    if (entry.isDirectory()) {
      fs.mkdirSync(destination, { recursive: true });
      copyTree(source, rel);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
    }
  }
}

copyTree(root);

const leaked = [];
for (const relativePath of excluded) {
  if (fs.existsSync(path.join(output, relativePath))) leaked.push(relativePath);
}
if (leaked.length) {
  console.error('ERRO: documentos comerciais encontrados no artefato público:', leaked);
  process.exit(1);
}
console.log('Build público concluído; cinco caminhos comerciais excluídos do artefato.');
console.log('Arquivos comerciais originais permanecem intactos no repositório.');
