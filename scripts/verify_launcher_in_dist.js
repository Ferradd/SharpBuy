import fs from 'fs';

// TEAM_001: Verify Windows launcher (required) and Mac launcher (optional, macOS-only)
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

// Mac launcher is optional - only exists if built on macOS
if (fs.existsSync(macLauncherPath)) {
  const macSize = fs.statSync(macLauncherPath).size;
  if (macSize < minBytes) {
    console.error(`Build error: dist/SharpBuy_Launcher.dmg is too small (${macSize} bytes).`);
    process.exit(1);
  }
  console.log(`OK: SharpBuy_Launcher.dmg in dist (${macSize} bytes)`);
} else {
  console.log('Note: Mac launcher not found (expected on non-macOS builds)');
}
