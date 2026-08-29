import fs from 'fs';

const exePath = 'C:\\Users\\iliyk\\Desktop\\SharpBuy_NFA.exe';
const buf = fs.readFileSync(exePath);
const str = buf.toString('latin1');

// Search for .pyc or module names in PyInstaller TOC
const pycMatches = str.match(/[a-zA-Z0-9_\-\\]+\.py[co]?/g) || [];
console.log('Unique Python files in PyInstaller:', [...new Set(pycMatches)].slice(0, 40));

// Search for any functions or variables related to token, login, steam
const steamCodeMatches = str.match(/def [a-zA-Z0-9_]+/g) || [];
console.log('Functions found:', [...new Set(steamCodeMatches)].slice(0, 30));

const tokenPatterns = str.match(/[a-zA-Z0-9_\.]{3,}(?:token|jwt|session|login|cookie|auth|steam)[a-zA-Z0-9_\.]{3,}/gi) || [];
console.log('Token/Auth strings in binary:', [...new Set(tokenPatterns)].slice(0, 30));
