#!/usr/bin/env node
'use strict';

// Build de saída pública: preserva os originais no Git e copia apenas o site publicado.
// Documentos internos/comerciais não são incluídos no artefato da Vercel.
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const output = path.join(root, 'public');
const excludedFiles = new Set([
  'assets/market-prices.json',
  'assets/market-prices.js',
  'PESQUISA_DE_PRECOS.md',
  'CUSTOS_DE_PRODUCAO_2026.md',
  'neon/cotacoes_ifood_2026-10-14.json',
  '.env.example',
  '.gitignore',
  'package.json',
  'package-lock.json',
]);
const excludedRootDirs = new Set([
  '.git', '.vercel', 'node_modules', 'public',
  'scripts', 'docs', 'neon'
]);

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

function copyTree(sourceDir, relativeDir = '') {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const rel = path.posix.join(relativeDir, entry.name);
    if (relativeDir === '' && excludedRootDirs.has(entry.name)) continue;
    if (excludedFiles.has(rel)) continue;

    // Markdown, testes e notas são materiais de trabalho, não páginas do site.
    if (/\.(md|markdown|cjs|mjs)$/i.test(entry.name)) continue;

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
for (const relativePath of excludedFiles) {
  if (fs.existsSync(path.join(output, relativePath))) leaked.push(relativePath);
}
for (const file of ['PESQUISA_DE_PRECOS.md', 'CUSTOS_DE_PRODUCAO_2026.md']) {
  if (fs.existsSync(path.join(output, file))) leaked.push(file);
}
if (leaked.length) {
  console.error('ERRO: arquivos internos/comerciais encontrados no artefato público:', [...new Set(leaked)]);
  process.exit(1);
}
console.log('Build público concluído; documentos comerciais e materiais Markdown internos excluídos.');
console.log('Arquivos originais permanecem intactos no repositório e no histórico Git.');
