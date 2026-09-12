#!/usr/bin/env node
/**
 * Extracts UI from the Windows SharpBuy_Launcher exe and patches it for Electron.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const destDir = path.join(root, 'ui');

const exeCandidates = [
  process.env.SHARPBUY_EXE,
  '/Users/admin/Downloads/Telegram Desktop/SharpBuy_Launcher (5).exe',
  '/Users/admin/Downloads/Telegram Desktop/SharpBuy_Launcher (2).exe',
  '/Users/admin/Downloads/Telegram Desktop/SharpBuy_Launcher.exe',
  path.join(root, '..', '..', '..', 'SharpBuy_Launcher.exe'),
].filter(Boolean);

function findExe() {
  for (const candidate of exeCandidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function extractHtml(exePath) {
  const data = fs.readFileSync(exePath);
  const start = data.indexOf(Buffer.from('<!DOCTYPE html>'));
  if (start < 0) {
    throw new Error(`HTML not found in ${exePath}`);
  }
  const end = data.indexOf(Buffer.from('</html>'), start);
  if (end < 0) {
    throw new Error(`HTML end tag not found in ${exePath}`);
  }
  return data.slice(start, end + '</html>'.length);
}

function patchHtml(html) {
  let out = html.replace(/\s*<script src="tauri-bridge\.js"><\/script>\s*/i, '\n');

  if (!out.includes('platform-electron')) {
    out = out.replace('<html lang="en">', '<html lang="en" class="platform-mac platform-electron">');
    out = out.replace('<body>', '<body class="platform-mac platform-electron">');
  }

  // Fix drawer performance: reduce transition times
  out = out.replace(/transition:\s*opacity 0\.28s/g, 'transition: opacity 0.2s');
  out = out.replace(/transform 0\.28s/g, 'transform 0.2s');
  out = out.replace(/visibility 0\.28s;/g, 'visibility 0.2s;');

  // Add electron-specific CSS for transparent edges
  const electronCSS = `
  body.platform-electron .launcher-card {
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  body.platform-electron .history-drawer {
    border: 1px solid rgba(249, 115, 22, 0.3);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    background: linear-gradient(180deg, rgba(16, 20, 28, 0.95) 0%, rgba(11, 14, 19, 0.95) 100%);
  }
`;
  if (!out.includes('body.platform-electron .launcher-card')) {
    out = out.replace('</style>', electronCSS + '</style>');
  }

  return out;
}

const exePath = findExe();
if (!exePath) {
  console.error('Windows exe not found. Set SHARPBUY_EXE or place SharpBuy_Launcher (2).exe in Telegram Desktop.');
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
const html = patchHtml(extractHtml(exePath).toString('utf8'));
fs.writeFileSync(path.join(destDir, 'index.html'), html, 'utf8');

const tauriBridge = path.join(destDir, 'tauri-bridge.js');
if (fs.existsSync(tauriBridge)) {
  fs.unlinkSync(tauriBridge);
}

console.log('Extracted UI from', exePath);
console.log('Patched UI written to', destDir);
