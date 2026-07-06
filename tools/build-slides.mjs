#!/usr/bin/env node
/**
 * Convert a .pptx to PNG slides + meta.json for slides.html viewer.
 *
 * Usage:
 *   node tools/build-slides.mjs slides/source/deck.pptx deck-id "Deck Title"
 *
 * Requires Microsoft PowerPoint on Windows (uses COM export).
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const [inputArg, deckId, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ').trim() || deckId;

if (!inputArg || !deckId) {
  console.error('Usage: node tools/build-slides.mjs <input.pptx> <deck-id> [title]');
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(deckId)) {
  console.error('deck-id must be lowercase letters, numbers, and hyphens only.');
  process.exit(1);
}

const inputPath = path.resolve(root, inputArg);
const outputDir = path.join(root, 'slides', deckId);
const ps1 = path.join(__dirname, 'build-slides.ps1');

if (!fs.existsSync(inputPath)) {
  console.error(`Input not found: ${inputPath}`);
  process.exit(1);
}

console.log(`Exporting slides from ${path.basename(inputPath)} …`);

const count = Number(
  execFileSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1, '-InputPath', inputPath, '-OutputDir', outputDir],
    { encoding: 'utf8', cwd: root },
  )
    .trim()
    .split(/\r?\n/)
    .pop(),
);

const slides = Array.from({ length: count }, (_, i) => `slide-${String(i + 1).padStart(2, '0')}.png`);

const meta = {
  id: deckId,
  title,
  subtitle: '幻灯片 · 键盘 ← → 或点击切换 · F 全屏',
  slides,
  updated: new Date().toISOString().slice(0, 10),
};

fs.writeFileSync(path.join(outputDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

console.log(`Done: ${count} slides → slides/${deckId}/`);
console.log(`Preview: slides.html?deck=${deckId}`);
