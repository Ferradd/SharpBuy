import fs from 'fs';

const buf = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\nfa.exe');
const str = buf.toString('utf8', 0, buf.length);

console.log('Searching for Rust/Tauri command handlers in nfa.exe...\n');

// Tauri command definitions usually look like: __cmd__<name> or tauri::command or cmd = "<name>"
const cmdMatches = str.match(/__cmd__[a-zA-Z0-9_]+/g) || [];
console.log('Tauri __cmd__ matches:', [...new Set(cmdMatches)]);

// Search for Steam functions
const fnMatches = str.match(/(?:login|steam|token|warranty|launch|kill|reset|dir|path)[a-zA-Z0-9_]*/gi) || [];
const uniqueFns = [...new Set(fnMatches)].filter(f => f.length > 5 && f.length < 35);
console.log('\nRelevant function/variable keywords (sample):', uniqueFns.slice(0, 30));
