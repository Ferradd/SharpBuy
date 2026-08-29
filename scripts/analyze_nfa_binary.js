import fs from 'fs';

const buf = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\nfa.exe');
const str = buf.toString('latin1');

console.log('=== NFA.EXE TECHNICAL ARCHITECTURE ANALYSIS ===\n');
console.log('File size:', (buf.length / 1024 / 1024).toFixed(2), 'MB');

const signatures = [
  { name: 'PyInstaller (Python)', pattern: /pyi-windows|pyinstaller|MEI\d+/i },
  { name: 'PyQt / Qt', pattern: /PyQt5|PyQt6|Qt5Core|Qt6Core|QtWidgets/i },
  { name: 'Tkinter (Python GUI)', pattern: /_tkinter|tcl8|tk8/i },
  { name: '.NET Framework / C#', pattern: /_CorExeMain|mscoree\.dll|<Module>/i },
  { name: 'Rust Binary', pattern: /cargo|rustc|library\/std\/src/i },
  { name: 'Golang Binary', pattern: /Go buildinf|runtime\.main|runtime\.goexit/i },
  { name: 'C++ / Native Win32 / MFC', pattern: /MSVCP\d+|ADVAPI32|SHELL32|RegOpenKey/i },
  { name: 'WebView2 / Edge', pattern: /WebView2Loader|CreateCoreWebView2Environment/i },
  { name: 'Electron / Node.js', pattern: /node\.dll|electron\.asar|v8::/i },
  { name: 'UPX Packer', pattern: /UPX0|UPX1|UPX!/i },
  { name: 'InnoSetup / NSIS Installer', pattern: /Inno Setup|Nullsoft/i }
];

for (const sig of signatures) {
  const match = str.match(sig.pattern);
  console.log(`• ${sig.name.padEnd(30)}: ${match ? `✅ DETECTED (${match[0]})` : '❌ No'}`);
}

// Find interesting URLs or endpoints
const urls = str.match(/https?:\/\/[a-zA-Z0-9.\-_/:]+/g) || [];
const uniqueUrls = [...new Set(urls)].filter(u => u.length < 80 && !u.includes('w3.org') && !u.includes('schemas.microsoft'));
console.log('\nHardcoded URLs / Endpoints in nfa.exe:');
console.log(uniqueUrls);

// Search for Steam registry / files mentions
const steamRefs = str.match(/(?:Steam|loginusers|vdf|Registry|AutoLoginUser|Valve)[a-zA-Z0-9_\-\.\/\\]*/gi) || [];
const uniqueSteam = [...new Set(steamRefs)].filter(s => s.length > 4 && s.length < 50);
console.log('\nSteam / Config references in nfa.exe (sample):');
console.log(uniqueSteam.slice(0, 20));
