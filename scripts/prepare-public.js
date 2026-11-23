'use strict';

/** Copy site/ → public/ so Vercel serves CSS/JS/images at the URL root. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'site');
const DEST = path.join(ROOT, 'public');

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const srcPath = path.join(from, entry.name);
    const destPath = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

fs.rmSync(DEST, { recursive: true, force: true });
copyDir(SRC, DEST);
console.log('Prepared public/ from site/ for Vercel static hosting');
