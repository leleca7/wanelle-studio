#!/usr/bin/env node
'use strict';

// Testes de regressão para a allowlist: simulam arquivos internos novos e garantem
// que nenhum deles seja copiado para public/. Todos os arquivos-sentinela são removidos.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.cwd();
const output = path.join(root, 'public');
const sentinels = [
  '.hotfix-regression-secret',
  'assets/internal-regression.json',
  'assets/.internal-regression.json',
  'api/__hotfix-regression-server-function.js',
  'docs/__hotfix-regression-note.md',
  '.env.hotfix-regression',
];
const madeDirs = [];
const created = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walk(dir, rel = '') {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const next = rel ? path.posix.join(rel, entry.name) : entry.name;
    assert(!entry.name.startsWith('.'), 'Arquivo oculto encontrado no artefato: ' + next);
    assert(!entry.isSymbolicLink(), 'Link simbólico encontrado no artefato: ' + next);
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(abs, next));
    else if (entry.isFile()) files.push(next);
    else throw new Error('Entrada especial encontrada no artefato: ' + next);
  }
  return files;
}

try {
  for (const rel of sentinels) {
    const abs = path.join(root, rel);
    const parent = path.dirname(abs);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
      madeDirs.push(parent);
    }
    assert(!fs.existsSync(abs), 'Colisão com arquivo de teste já existente: ' + rel);
    fs.writeFileSync(abs, 'SENTINEL_INTERNAL_NOT_FOR_PUBLIC_OUTPUT\n', { flag: 'wx' });
    created.push(abs);
  }

  execFileSync(process.execPath, [path.join(root, 'scripts/build-public-site.cjs')], {
    cwd: root, stdio: 'pipe'
  });

  const files = walk(output);
  const expected = [
    'index.html', 'admin.html', 'redefinir-senha.html', 'links.html', 'config.js',
    'assets/admin.css', 'assets/wanelle-core.js',
    'assets/wanelle-admin.js', 'assets/storefront-intake.js'
  ];
  for (const rel of expected) assert(files.includes(rel), 'Dependência pública ausente: ' + rel);

  for (const rel of sentinels) {
    assert(!files.includes(rel), 'Arquivo sentinela interno vazou para public/: ' + rel);
  }

  const forbidden = [
    'assets/market-prices.json', 'assets/market-prices.js',
    'PESQUISA_DE_PRECOS.md', 'CUSTOS_DE_PRODUCAO_2026.md',
    'neon/cotacoes_ifood_2026-10-14.json', 'api/wanelle.js',
    'package.json', 'package-lock.json', '.env', '.env.example',
    'scripts/build-public-site.cjs', 'scripts/test-public-site.cjs'
  ];
  for (const rel of forbidden) assert(!files.includes(rel), 'Arquivo proibido no artefato: ' + rel);
  assert(!files.some(rel => rel.startsWith('api/')), 'Código de funções da API copiado como arquivo estático.');
  assert(!files.some(rel => rel.startsWith('neon/')), 'Arquivos Neon copiados para o artefato público.');
  assert(!files.some(rel => /\.(md|markdown|cjs|mjs|map)$/i.test(rel)), 'Documento, ferramenta ou source map no artefato.');
  assert(!files.includes('assets/market-prices.js'), 'Painel não deve carregar pesquisa comercial pública.');

  const resetHtml = fs.readFileSync(path.join(output, 'redefinir-senha.html'), 'utf8');
  assert(resetHtml.includes('/api/wanelle?action=reset-password'), 'A página de recuperação perdeu o endpoint esperado.');
  const linksHtml = fs.readFileSync(path.join(output, 'links.html'), 'utf8');
  assert(linksHtml.includes('Wanelle'), 'Página de links não foi preservada.');
  const adminHtml = fs.readFileSync(path.join(output, 'admin.html'), 'utf8');
  assert(!adminHtml.includes('assets/market-prices.js'), 'admin.html ainda referencia o script comercial removido.');
  const adminJs = fs.readFileSync(path.join(output, 'assets/wanelle-admin.js'), 'utf8');
  assert(adminJs.includes('Pesquisa comercial protegida'), 'Painel não informa por que a pesquisa está indisponível.');
  assert(adminJs.includes('function settings()'), 'Seção de custos foi removida ou não está disponível.');

  console.log('PASS: artefato recursivo contém apenas caminhos permitidos (' + files.length + ' arquivos).');
  console.log('PASS: novos arquivos ocultos, documentos, arquivos de ambiente, ferramentas e funções serverless não vazam.');
  console.log('PASS: painel não depende do arquivo comercial público; seção de custos permanece.');
} catch (error) {
  console.error('FAIL: ' + error.message);
  process.exitCode = 1;
} finally {
  for (const abs of created.reverse()) {
    try { fs.unlinkSync(abs); } catch {}
  }
  for (const dir of madeDirs.reverse()) {
    try { fs.rmdirSync(dir); } catch {}
  }
}
