import fs from 'fs';
import path from 'path';

const exePath = 'C:\\Users\\iliyk\\Desktop\\SharpBuy_NFA.exe';
const buf = fs.readFileSync(exePath);

console.log('File size:', buf.length, 'bytes');

// Check magic headers
if (buf.includes(Buffer.from('7z\xBC\xAF\x27\x1C'))) {
  console.log('Detected: 7-Zip SFX Archive!');
}
if (buf.includes(Buffer.from('PK\x03\x04'))) {
  console.log('Detected: ZIP / Electron / Java package!');
}
if (buf.includes(Buffer.from('PE\x00\x00'))) {
  console.log('Detected: Windows PE Executable');
}
if (buf.includes(Buffer.from('MEI\x0C\x0B\x0A\x0B\x0E'))) {
  console.log('Detected: PyInstaller Archive!');
}
if (buf.includes(Buffer.from('app.asar'))) {
  console.log('Detected: Electron app.asar inside!');
}

// Search for strings containing urls, apis, shefu, steam
const str = buf.toString('latin1');
const urls = str.match(/https?:\/\/[a-zA-Z0-9_\-\.\/:]+/g) || [];
console.log('Found unique URLs:', [...new Set(urls)].slice(0, 30));

const steamRefs = str.match(/([a-zA-Z0-9_\-]{3,}\.steampowered\.com[a-zA-Z0-9_\-\.\/:]*)/gi) || [];
console.log('Steam domains/endpoints:', [...new Set(steamRefs)].slice(0, 20));
