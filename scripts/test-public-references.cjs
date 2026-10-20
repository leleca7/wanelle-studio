#!/usr/bin/env node
'use strict';

// Checks local asset/page references used by the public pages, CSS and shipped JS.
// No browser/network calls, no form submissions, and no writes outside public/.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(process.cwd(), 'public');
const sources = ['index.html','admin.html','config.js','assets/admin.css','assets/wanelle-core.js','assets/wanelle-admin.js','assets/storefront-intake.js'];
const allowedExtensions = new Set(['.html','.js','.css','.png','.jpg','.jpeg','.webp','.avif','.gif','.svg','.woff','.woff2']);
const refs = new Set();
const failures = [];
function read(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p) || !fs.statSync(p).isFile()) throw new Error('Required public source missing: ' + rel);
  return fs.readFileSync(p, 'utf8');
}
function addReference(raw, source) {
  let value = String(raw || '').trim().replaceAll('&amp;', '&');
  if (!value || value.startsWith('#') || /^(?:https?:|data:|blob:|mailto:|tel:|javascript:|\/\/)/i.test(value)) return;
  value = value.split(/[?#]/, 1)[0];
  try { value = decodeURIComponent(value); } catch {}
  if (!value || value.endsWith('/')) return;
  const normalized = path.posix.normalize(value.replace(/^\.\//, ''));
  if (normalized.startsWith('../') || normalized.startsWith('/')) return;
  // The only pages currently intentionally shipped are the storefront and admin shell.
  if (!allowedExtensions.has(path.posix.extname(normalized).toLowerCase())) return;
  refs.add(normalized + ' <- ' + source);
}
for (const source of sources) {
  const text = read(source);
  if (source.endsWith('.html')) {
    for (const m of text.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/gi)) addReference(m[1], source);
  }
  for (const m of text.matchAll(/(?:assets\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp|avif|gif|svg|css|js)|(?:^|["'(\s])(?:index|admin)\.html)(?:[?#][^"'\s)]*)?/gim)) {
    const candidate = m[0].trim().replace(/^["'(\s]+/, '');
    addReference(candidate, source);
  }
  for (const m of text.matchAll(/url\(\s*["']?([^"'\)]+)["']?\s*\)/gi)) addReference(m[1], source);
}
const missing = [];
for (const ref of refs) {
  const [pathName, source] = ref.split(' <- ');
  if (!fs.existsSync(path.join(root, pathName))) missing.push(pathName + ' referenced by ' + source);
}
if (missing.length) {
  console.error('FAIL: missing local references:\n' + [...new Set(missing)].sort().join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS: local page/style/script/image references resolve (' + refs.size + ' references checked).');
}
