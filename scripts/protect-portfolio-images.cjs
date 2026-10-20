#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = process.cwd();
const sourceDir = path.join(root, 'assets', 'media');
const outputDir = path.join(root, 'assets', 'portfolio-protegido');
const logoName = 'foto-d1a021079f73c4.png';
const QUALITY = 84;
const MAX_EDGE = 1800;

async function meanBrightness(input) {
  const result = await sharp(input).rotate().resize({ width: 48, height: 48, fit: 'fill' })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const data = result.data, info = result.info;
  let sum = 0, n = 0;
  const x0 = Math.floor(info.width * 0.24), x1 = Math.ceil(info.width * 0.76);
  const y0 = Math.floor(info.height * 0.72), y1 = Math.ceil(info.height * 0.94);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * info.width + x) * info.channels;
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; n++;
  }
  return n ? sum / n : 128;
}

function watermarkSvg(width, height, bright) {
  const size = Math.max(18, Math.min(42, Math.round(width * 0.034)));
  const cx = Math.round(width / 2), y = Math.round(height * 0.895);
  const half = Math.round(width * 0.19);
  const color = bright ? '#6e2038' : '#ffffff';
  const shadow = bright ? 'rgba(255,255,255,.52)' : 'rgba(20,8,12,.72)';
  const stroke = bright ? 'rgba(255,255,255,.44)' : 'rgba(38,10,20,.60)';
  const spacing = Math.max(1, Math.round(size * .11));
  const line = Math.max(1, size * .045);
  return Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">' +
    '<defs><filter id="s" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.1"/></filter></defs>' +
    '<text x="' + cx + '" y="' + y + '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="' + size + '" font-weight="700" letter-spacing="' + spacing + '" fill="' + shadow + '" opacity=".76" filter="url(#s)" transform="translate(0 1.5)">WANELLE TORTAS ©</text>' +
    '<text x="' + cx + '" y="' + y + '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="' + size + '" font-weight="700" letter-spacing="' + spacing + '" fill="' + color + '" fill-opacity=".88" stroke="' + stroke + '" stroke-width="' + Math.max(.45, size * .025) + '" paint-order="stroke fill">WANELLE TORTAS ©</text>' +
    '<path d="M ' + (cx - half) + ' ' + (y + Math.round(size * .52)) + ' H ' + (cx + half) + '" fill="none" stroke="' + color + '" stroke-opacity=".76" stroke-width="' + line + '"/>' +
    '</svg>'
  );
}

async function main() {
  if (!fs.existsSync(sourceDir)) throw new Error('Source photo directory assets/media was not found.');
  fs.mkdirSync(outputDir, { recursive: true });
  const files = fs.readdirSync(sourceDir).filter(n => /\.(jpe?g|png|webp|avif)$/i.test(n));
  if (!files.length) throw new Error('No source images found; refusing to deploy an empty protected gallery.');
  let photos = 0, logos = 0, totalBefore = 0, totalAfter = 0;
  for (const name of files) {
    const src = path.join(sourceDir, name), isLogo = name === logoName;
    const stem = path.parse(name).name;
    const dest = path.join(outputDir, isLogo ? 'wanelle-logo.png' : stem + '.webp');
    totalBefore += fs.statSync(src).size;
    if (isLogo) {
      await sharp(src).rotate().png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(dest);
      logos++;
    } else {
      const meta = await sharp(src).metadata();
      const width = Math.min(MAX_EDGE, meta.width || MAX_EDGE);
      const pipeline = sharp(src).rotate().resize({ width: width, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true });
      const brightness = await meanBrightness(src);
      const rendered = await pipeline.clone().toBuffer({ resolveWithObject: true });
      const svg = watermarkSvg(rendered.info.width, rendered.info.height, brightness >= 178);
      await sharp(rendered.data).composite([{ input: svg, blend: 'over' }])
        .webp({ quality: QUALITY, effort: 5, smartSubsample: true }).toFile(dest);
      const verified = await sharp(dest).metadata();
      if (verified.exif || verified.iptc || verified.xmp || verified.location) {
        throw new Error('Personal metadata remained in derivative: ' + path.basename(dest));
      }
      if (verified.format !== 'webp' || !verified.width || !verified.height) {
        throw new Error('Invalid protected WebP derivative: ' + path.basename(dest));
      }
      photos++;
    }
    totalAfter += fs.statSync(dest).size;
  }
  for (const htmlName of ['index.html', 'admin.html', 'redefinir-senha.html', 'privacidade.html', 'links.html', 'marca-dagua-preview.html']) {
    const file = path.join(root, htmlName);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    for (const name of files) {
      const protectedName = name === logoName ? 'wanelle-logo.png' : path.parse(name).name + '.webp';
      html = html.split('assets/media/' + name).join('assets/portfolio-protegido/' + protectedName);
    }
    fs.writeFileSync(file, html);
  }
  // Keep every source image untouched in the workspace; the public copy excludes assets/media.
  const report = {
    photosWatermarked: photos, logoAssetsReencoded: logos,
    sourceFilesExcludedFromPublicOutput: files.length,
    originalBytes: totalBefore, protectedBytes: totalAfter,
    sizeReductionPercent: totalBefore ? Math.round((1 - totalAfter / totalBefore) * 1000) / 10 : 0,
    maxEdge: MAX_EDGE, webpQuality: QUALITY, metadataStrippedByReencoding: true
  };
  fs.writeFileSync(path.join(outputDir, 'build-report.json'), JSON.stringify(report, null, 2));

  // Deploy only the explicit public surface, not docs, tests, scripts, package files or source photos.
  const publicDir = path.join(root, 'public');
  fs.rmSync(publicDir, { recursive: true, force: true });
  fs.mkdirSync(publicDir, { recursive: true });
  const staticFiles = ['index.html', 'admin.html', 'redefinir-senha.html', 'privacidade.html', 'links.html', 'marca-dagua-preview.html', 'robots.txt', 'sitemap.xml', 'config.js'];
  for (const name of staticFiles) {
    const from = path.join(root, name);
    if (fs.existsSync(from) && fs.statSync(from).isFile()) fs.copyFileSync(from, path.join(publicDir, name));
  }
  fs.cpSync(path.join(root, 'assets'), path.join(publicDir, 'assets'), {
    recursive: true,
    filter: source => !source.includes(path.join('assets', 'media'))
  });
  const deployedSources = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else deployedSources.push(path.relative(publicDir, full).replace(/\\\\/g, '/'));
    }
  }
  walk(publicDir);
  if (deployedSources.some(name => name.startsWith('assets/media/'))) {
    throw new Error('Source media directory leaked into public output.');
  }
  for (const htmlName of staticFiles.filter(name => name.endsWith('.html'))) {
    const htmlPath = path.join(publicDir, htmlName);
    if (!fs.existsSync(htmlPath)) continue;
    const html = fs.readFileSync(htmlPath, 'utf8');
    if (html.includes('assets/media/')) throw new Error('Public HTML still references source media: ' + htmlName);
    for (const match of html.matchAll(/(?:src|href)=["'](assets\/[^"'?#]+)/g)) {
      const assetPath = path.join(publicDir, match[1]);
      if (!fs.existsSync(assetPath)) throw new Error('Missing public asset reference: ' + match[1] + ' in ' + htmlName);
    }
  }
  report.publicOutputFiles = deployedSources.length;
  report.sourcePhotoPathsInPublicOutput = 0;
  fs.writeFileSync(path.join(outputDir, 'build-report.json'), JSON.stringify(report, null, 2));
  // Copy the final report after adding the public-output verification.
  fs.copyFileSync(path.join(outputDir, 'build-report.json'), path.join(publicDir, 'assets', 'portfolio-protegido', 'build-report.json'));
  console.log('Portfolio protection build: ' + JSON.stringify(report));
}
main().catch(err => { console.error('Portfolio protection failed:', err.message); process.exit(1); });
