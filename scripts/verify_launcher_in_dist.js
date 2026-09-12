import fs from 'fs';

// TEAM_001: Verify both Windows and Mac launchers
const winLauncherPath = 'dist/SharpBuy_Launcher.exe';
const macLauncherPath = 'dist/SharpBuy_Launcher.dmg';
const minBytes = 1_000_000;

if (!fs.existsSync(winLauncherPath)) {
  console.error('Build error: dist/SharpBuy_Launcher.exe is missing.');
  console.error('Run: pwsh scripts/publish_launcher.ps1');
  process.exit(1);
}

const winSize = fs.statSync(winLauncherPath).size;
if (winSize < minBytes) {
  console.error(`Build error: dist/SharpBuy_Launcher.exe is too small (${winSize} bytes).`);
  process.exit(1);
}

console.log(`OK: SharpBuy_Launcher.exe in dist (${winSize} bytes)`);

if (!fs.existsSync(macLauncherPath)) {
  console.error('Build error: dist/SharpBuy_Launcher.dmg is missing.');
  console.error('Run: cp "src/launcher/SharpBuy_Launcher_Electron/dist/SharpBuy Launcher-1.0.0-macOS-arm64.dmg" dist/SharpBuy_Launcher.dmg');
  process.exit(1);
}

const macSize = fs.statSync(macLauncherPath).size;
if (macSize < minBytes) {
  console.error(`Build error: dist/SharpBuy_Launcher.dmg is too small (${macSize} bytes).`);
  process.exit(1);
}

console.log(`OK: SharpBuy_Launcher.dmg in dist (${macSize} bytes)`);
