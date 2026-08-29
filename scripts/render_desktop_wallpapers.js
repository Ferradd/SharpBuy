import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { WORDMARK_VIEWBOX, LETTERS } from '../src/data/sharpbuyLetters.js';

const DESKTOP_DIR = 'C:\\Users\\iliyk\\Desktop';
const WALLPAPERS_FOLDER = path.join(DESKTOP_DIR, 'SharpBuy_Wallpapers_and_Logos');
const TEMP_DIR = path.join(process.cwd(), 'temp_render');

if (!fs.existsSync(WALLPAPERS_FOLDER)) {
  fs.mkdirSync(WALLPAPERS_FOLDER, { recursive: true });
}
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// Generate SVG Paths for the SHARPBUY wordmark
const lettersSvgContent = LETTERS.map((letter) => {
  const isBuy = letter.isBuy;
  const strokeColor = isBuy ? '#FF5500' : '#FFFFFF';
  const fillColor = isBuy ? 'url(#buy-smooth-fill)' : 'url(#sharp-smooth-fill)';
  return `<path d="${letter.d}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#ultra-smooth-glow)" />`;
}).join('\n');

const fullWordmarkSvg = `
<svg viewBox="${WORDMARK_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; overflow: visible;">
  <defs>
    <filter id="ultra-smooth-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <linearGradient id="sharp-smooth-fill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="55%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>

    <linearGradient id="buy-smooth-fill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF7700" />
      <stop offset="50%" stop-color="#FF4400" />
      <stop offset="100%" stop-color="#CC2200" />
    </linearGradient>
  </defs>
  ${lettersSvgContent}
</svg>
`;

// Read karambit svg if available
let karambitSvg = '';
const karambitPath = path.join(process.cwd(), 'public', 'karambit-doppler.svg');
if (fs.existsSync(karambitPath)) {
  karambitSvg = fs.readFileSync(karambitPath, 'utf8');
}

// Read logo icon svg if available
let markSvg = '';
const markPath = path.join(process.cwd(), 'public', 'anim-s-full.svg');
if (fs.existsSync(markPath)) {
  markSvg = fs.readFileSync(markPath, 'utf8');
}

// 1. HTML: 4K Dark Wallpaper
const htmlWallpaperDark = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 3840px;
      height: 2160px;
      background-color: #070707;
      background-image: 
        radial-gradient(circle at 50% 50%, rgba(255, 68, 0, 0.15) 0%, transparent 60%),
        radial-gradient(rgba(255, 255, 255, 0.04) 1.5px, transparent 1.5px);
      background-size: 100% 100%, 36px 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }
    .ambient-glow {
      position: absolute;
      width: 1800px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(232, 88, 58, 0.35) 0%, rgba(255, 50, 0, 0.1) 50%, transparent 75%);
      filter: blur(80px);
      z-index: 1;
    }
    .logo-container {
      position: relative;
      z-index: 10;
      width: 2400px;
      max-width: 80%;
      filter: drop-shadow(0 20px 50px rgba(0,0,0,0.9)) drop-shadow(0 0 40px rgba(255,85,0,0.55));
    }
    .tagline {
      position: absolute;
      bottom: 240px;
      z-index: 10;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 14px;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
    }
    .tagline span {
      color: #E8583A;
    }
    .corner-decor {
      position: absolute;
      font-family: 'Consolas', monospace;
      font-size: 22px;
      color: rgba(255, 255, 255, 0.2);
      letter-spacing: 4px;
    }
    .top-left { top: 80px; left: 100px; }
    .bottom-right { bottom: 80px; right: 100px; }
  </style>
</head>
<body>
  <div class="corner-decor top-left">SHARPBUY // 2026 EDITION</div>
  <div class="corner-decor bottom-right">3840 x 2160 UHD // PRO GAMING ASSETS</div>
  <div class="ambient-glow"></div>
  <div class="logo-container">
    ${fullWordmarkSvg}
  </div>
  <div class="tagline">ESPORTS MARKETPLACE <span>//</span> ULTRA FAST AUTOMATION</div>
</body>
</html>
`;

// 2. HTML: 4K Minimal Titanium Edition
const htmlWallpaperMinimal = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 3840px;
      height: 2160px;
      background-color: #0A0A0B;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .logo-container {
      position: relative;
      z-index: 10;
      width: 2100px;
      max-width: 75%;
      filter: drop-shadow(0 25px 60px rgba(0,0,0,0.95));
    }
    .subtle-line {
      position: absolute;
      width: 600px;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(232,88,58,0.6), transparent);
      bottom: 720px;
    }
  </style>
</head>
<body>
  <div class="logo-container">
    ${fullWordmarkSvg}
  </div>
  <div class="subtle-line"></div>
</body>
</html>
`;

// 3. HTML: 4K Flame / Karambit Special
const htmlWallpaperKarambit = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 3840px;
      height: 2160px;
      background-color: #060504;
      background-image: 
        radial-gradient(circle at 65% 45%, rgba(232, 88, 58, 0.25) 0%, transparent 65%),
        radial-gradient(rgba(255, 255, 255, 0.03) 2px, transparent 2px);
      background-size: 100% 100%, 48px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 300px;
      position: relative;
      overflow: hidden;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .left-side {
      width: 1800px;
      z-index: 10;
    }
    .tagline {
      margin-top: 50px;
      font-family: 'Consolas', monospace;
      font-size: 34px;
      letter-spacing: 12px;
      color: rgba(255,255,255,0.45);
      text-transform: uppercase;
    }
    .right-knife {
      width: 1100px;
      height: 1100px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 60px rgba(232,88,58,0.4));
      transform: rotate(-15deg);
    }
    .right-knife svg, .right-knife img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div class="left-side">
    <div style="filter: drop-shadow(0 15px 40px rgba(0,0,0,0.9)) drop-shadow(0 0 30px rgba(255,85,0,0.5));">
      ${fullWordmarkSvg}
    </div>
    <div class="tagline">PRIME MARKETPLACE // CS2 & STEAM</div>
  </div>
  <div class="right-knife">
    ${karambitSvg ? karambitSvg : '<img src="../public/knife-final.png" />'}
  </div>
</body>
</html>
`;

// 4. HTML: High-Res Transparent Wordmark Logo
const htmlLogoTransparent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 3840px;
      height: 1200px;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .logo-box {
      width: 3600px;
      filter: drop-shadow(0 0 30px rgba(255,85,0,0.6));
    }
  </style>
</head>
<body>
  <div class="logo-box">
    ${fullWordmarkSvg}
  </div>
</body>
</html>
`;

// 5. HTML: High-Res Transparent Icon Emblem
const htmlIconTransparent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 2048px;
      height: 2048px;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .icon-box {
      width: 1800px;
      height: 1800px;
      filter: drop-shadow(0 0 40px rgba(255,85,0,0.5));
    }
    svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="icon-box">
    ${markSvg}
  </div>
</body>
</html>
`;

// Renders
const tasks = [
  {
    name: 'SharpBuy_Wallpaper_4K_Dark.png',
    html: htmlWallpaperDark,
    width: 3840,
    height: 2160,
    transparent: false,
    copyToDesktopRoot: true
  },
  {
    name: 'SharpBuy_Wallpaper_4K_Minimal.png',
    html: htmlWallpaperMinimal,
    width: 3840,
    height: 2160,
    transparent: false,
    copyToDesktopRoot: true
  },
  {
    name: 'SharpBuy_Wallpaper_4K_Karambit.png',
    html: htmlWallpaperKarambit,
    width: 3840,
    height: 2160,
    transparent: false,
    copyToDesktopRoot: true
  },
  {
    name: 'SharpBuy_Logo_Wordmark_4K_Transparent.png',
    html: htmlLogoTransparent,
    width: 3840,
    height: 1200,
    transparent: true,
    copyToDesktopRoot: true
  },
  {
    name: 'SharpBuy_Icon_Emblem_2K_Transparent.png',
    html: htmlIconTransparent,
    width: 2048,
    height: 2048,
    transparent: true,
    copyToDesktopRoot: true
  }
];

console.log('Rendering 4K Wallpapers and Logos via Headless Chrome...');

for (const t of tasks) {
  const tempHtmlPath = path.join(TEMP_DIR, `${t.name}.html`);
  const outPathInFolder = path.join(WALLPAPERS_FOLDER, t.name);
  const outPathRoot = path.join(DESKTOP_DIR, t.name);

  fs.writeFileSync(tempHtmlPath, t.html, 'utf8');

  const args = [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${t.width},${t.height}`,
    `--screenshot=${outPathInFolder}`,
  ];

  if (t.transparent) {
    args.push('--default-background-color=00000000');
  }

  args.push(`file:///${tempHtmlPath.replace(/\\/g, '/')}`);

  try {
    execFileSync(CHROME_PATH, args, { stdio: 'ignore' });
    console.log(`✓ Rendered: ${t.name} (${t.width}x${t.height})`);

    // Also copy to Desktop root for instant 1-click access
    if (t.copyToDesktopRoot && fs.existsSync(outPathInFolder)) {
      fs.copyFileSync(outPathInFolder, outPathRoot);
    }
  } catch (err) {
    console.error(`Error rendering ${t.name}:`, err.message);
  }
}

console.log('\nAll 4K Wallpapers and PNG Logos successfully generated on Desktop!');
