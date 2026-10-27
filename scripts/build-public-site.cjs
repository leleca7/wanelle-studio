#!/usr/bin/env node
'use strict';

// Allowlist de saída: somente páginas, scripts de interface e imagens de portfólio.
// O diretório api/ permanece na raiz do projeto para a Vercel executar funções serverless;
// nunca é copiado para public/.
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const output = path.join(root, 'public');
const allowedRootFiles = new Set(['index.html', 'admin.html', 'redefinir-senha.html', 'links.html', 'config.js']);
const allowedAssetFiles = new Set([
  'assets/admin.css',
  'assets/wanelle-core.js',
  'assets/wanelle-admin.js',
  'assets/storefront-intake.js',
]);
const mediaRoot = 'assets/media';
const allowedMediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg']);

function fail(message) {
  console.error('ERRO de segurança no build público: ' + message);
  process.exitCode = 1;
}

function isSafeRelative(rel) {
  if (!rel || rel.startsWith('/') || rel.split('/').some(part => !part || part === '.' || part === '..' || part.startsWith('.'))) return false;
  if (allowedRootFiles.has(rel) || allowedAssetFiles.has(rel)) return true;
  if (!rel.startsWith(mediaRoot + '/')) return false;
  return allowedMediaExtensions.has(path.extname(rel).toLowerCase());
}

function copyAllowedFile(rel) {
  const source = path.join(root, rel);
  const destination = path.join(output, rel);
  const stat = fs.lstatSync(source);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Entrada pública não é arquivo regular: ' + rel);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function walkMedia(dir, rel = mediaRoot) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) throw new Error('Arquivo oculto proibido em mídia pública: ' + path.posix.join(rel, entry.name));
    const childRel = path.posix.join(rel, entry.name);
    const childPath = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Link simbólico proibido: ' + childRel);
    if (entry.isDirectory()) walkMedia(childPath, childRel);
    else if (entry.isFile() && isSafeRelative(childRel)) copyAllowedFile(childRel);
    else throw new Error('Arquivo não autorizado na pasta de mídia: ' + childRel);
  }
}

function walkOutput(dir, rel = '') {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const childRel = rel ? path.posix.join(rel, entry.name) : entry.name;
    if (entry.name.startsWith('.')) throw new Error('Arquivo oculto encontrado na saída: ' + childRel);
    if (entry.isSymbolicLink()) throw new Error('Link simbólico encontrado na saída: ' + childRel);
    const childPath = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walkOutput(childPath, childRel));
    else if (entry.isFile()) {
      if (!isSafeRelative(childRel)) throw new Error('Arquivo fora da allowlist no artefato público: ' + childRel);
      found.push(childRel);
    } else throw new Error('Entrada especial no artefato público: ' + childRel);
  }
  return found;
}

try {
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });

  for (const rel of allowedRootFiles) {
    if (!fs.existsSync(path.join(root, rel))) throw new Error('Arquivo público obrigatório ausente: ' + rel);
    copyAllowedFile(rel);
  }
  for (const rel of allowedAssetFiles) {
    if (!fs.existsSync(path.join(root, rel))) throw new Error('Dependência pública obrigatória ausente: ' + rel);
    copyAllowedFile(rel);
  }
  if (!fs.existsSync(path.join(root, mediaRoot))) throw new Error('Diretório de imagens públicas ausente: ' + mediaRoot);
  walkMedia(path.join(root, mediaRoot));

  const files = walkOutput(output).sort();
  const forbidden = [
    'assets/market-prices.json',
    'assets/market-prices.js',
    'PESQUISA_DE_PRECOS.md',
    'CUSTOS_DE_PRODUCAO_2026.md',
    'neon/cotacoes_ifood_2026-10-14.json',
  ];
  for (const rel of forbidden) {
    if (fs.existsSync(path.join(output, rel))) throw new Error('Documento comercial presente na saída: ' + rel);
  }
  console.log('Build público allowlist concluído: ' + files.length + ' arquivos autorizados.');
  console.log('Nenhuma API, configuração oculta, documento de trabalho ou arquivo de ambiente foi copiado.');
} catch (error) {
  fail(error.message);
}
