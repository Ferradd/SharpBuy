import fs from 'fs';

const exePath = 'C:\\Users\\iliyk\\Desktop\\SharpBuy_NFA.exe';
if (fs.existsSync(exePath)) {
  const buf = fs.readFileSync(exePath);
  console.log('SharpBuy_NFA.exe size:', buf.length, 'bytes');

  // Search for interesting strings
  const str = buf.toString('latin1');
  const matches = [];
  const patterns = ['steam', 'loginusers', 'config.vdf', 'token', 'steamLoginSecure', 'registry', 'HKCU', 'SteamPath', 'Valve'];

  for (const p of patterns) {
    const regex = new RegExp(`[^\x00-\x1F\x7F-\xFF]{4,}${p}[^\x00-\x1F\x7F-\xFF]{4,}`, 'gi');
    const m = str.match(regex);
    if (m) {
      console.log(`Found pattern "${p}":`, [...new Set(m)].slice(0, 5));
    }
  }
} else {
  console.log('SharpBuy_NFA.exe does not exist');
}
