import fs from 'fs';

const buf = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\nfa.exe');
const str = buf.toString('latin1');

console.log('Searching for embedded HTML/JS inside nfa.exe...\n');

// Search for HTML tags or JS function names
const htmlSnippetMatches = str.match(/<!DOCTYPE html>[\s\S]{100,5000}<\/html>/gi) || [];
console.log(`Found ${htmlSnippetMatches.length} HTML document snippets in binary.`);

if (htmlSnippetMatches.length > 0) {
  console.log('Sample HTML from nfa.exe (first 500 chars):\n', htmlSnippetMatches[0].slice(0, 500));
} else {
  // Search for inline JS/HTML tags
  const tags = str.match(/<div class="[^"]+"/g) || [];
  console.log('Classes found in nfa.exe binary:', [...new Set(tags)].slice(0, 20));
}

// Search for Tauri commands / ipc messages
const tauriCmds = str.match(/invoke\(["'][^"']+["']\)|tauri:\/\/|__TAURI__/g) || [];
console.log('Tauri invokes found:', [...new Set(tauriCmds)]);
