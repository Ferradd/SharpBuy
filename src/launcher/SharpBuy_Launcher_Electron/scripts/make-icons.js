#!/usr/bin/env node
/**
 * Converts assets/icon.ico to build/icon.icns on macOS.
 * Falls back to a placeholder icon when icon.ico is missing.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const icoCandidates = [
  path.join(root, 'assets', 'icon.png'),
  path.join(root, 'assets', 'icon.ico'),
  path.join(root, '..', '..', '..', 'assets', 'icon.ico'),
];
const buildDir = path.join(root, 'build');
const iconset = path.join(buildDir, 'icon.iconset');
const icns = path.join(buildDir, 'icon.icns');
const png = path.join(buildDir, 'icon.png');

function findSourceIcon() {
  for (const p of icoCandidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function createPlaceholderPng() {
  fs.mkdirSync(buildDir, { recursive: true });
  try {
    execSync(
      `python3 - <<'PY'
from PIL import Image, ImageDraw
img = Image.new('RGBA', (512, 512), (17, 20, 26, 255))
draw = ImageDraw.Draw(img)
draw.ellipse((96, 96, 416, 416), fill=(249, 115, 22, 255))
draw.rectangle((196, 236, 316, 316), fill=(17, 20, 26, 255))
img.save(${JSON.stringify(png)})
PY`,
      { stdio: 'inherit' }
    );
    return;
  } catch (_) {}

  // Minimal valid PNG if Pillow is unavailable.
  const minimalPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(png, minimalPng);
}

if (process.platform !== 'darwin') {
  console.log('Skip icon.icns generation (not on macOS).');
  process.exit(0);
}

fs.mkdirSync(buildDir, { recursive: true });

const sourceIcon = findSourceIcon();
if (sourceIcon) {
  if (sourceIcon.endsWith('.png')) {
    fs.copyFileSync(sourceIcon, png);
  } else {
    execSync(
      `python3 - <<'PY'
from PIL import Image
img = Image.open(${JSON.stringify(sourceIcon)})
img = img.convert('RGBA').resize((512, 512), Image.Resampling.LANCZOS)
img.save(${JSON.stringify(png)})
PY`,
      { stdio: 'inherit' }
    );
  }
} else {
  console.log('icon not found — generating placeholder icon');
  createPlaceholderPng();
}

if (fs.existsSync(iconset)) {
  fs.rmSync(iconset, { recursive: true, force: true });
}
fs.mkdirSync(iconset, { recursive: true });

const sizes = [
  [16, 'icon_16x16.png'],
  [32, 'icon_16x16@2x.png'],
  [32, 'icon_32x32.png'],
  [64, 'icon_32x32@2x.png'],
  [128, 'icon_128x128.png'],
  [256, 'icon_128x128@2x.png'],
  [256, 'icon_256x256.png'],
  [512, 'icon_256x256@2x.png'],
  [512, 'icon_512x512.png'],
];

for (const [size, name] of sizes) {
  execSync(`sips -z ${size} ${size} "${png}" --out "${path.join(iconset, name)}"`, { stdio: 'pipe' });
}
fs.copyFileSync(path.join(iconset, 'icon_512x512.png'), path.join(iconset, 'icon_512x512@2x.png'));

execSync(`iconutil -c icns "${iconset}" -o "${icns}"`, { stdio: 'inherit' });
console.log('Created', icns);
