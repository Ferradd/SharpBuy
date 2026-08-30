import fs from 'fs';

const launcherPath = 'dist/SharpBuy_Launcher.exe';
const minBytes = 1_000_000;

if (!fs.existsSync(launcherPath)) {
  console.error('Build error: dist/SharpBuy_Launcher.exe is missing.');
  console.error('Run: pwsh scripts/publish_launcher.ps1');
  process.exit(1);
}

const size = fs.statSync(launcherPath).size;
if (size < minBytes) {
  console.error(`Build error: dist/SharpBuy_Launcher.exe is too small (${size} bytes).`);
  process.exit(1);
}

console.log(`OK: SharpBuy_Launcher.exe in dist (${size} bytes)`);
