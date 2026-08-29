import fs from 'fs';

const buf = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\nfa.exe');
const str = buf.toString('latin1');

console.log('Searching for URLs and check keywords in nfa.exe...');
const urls = str.match(/https?:\/\/[a-zA-Z0-9.\-_/:]+/g) || [];
const uniqueUrls = [...new Set(urls)].filter(u => !u.includes('w3.org') && !u.includes('microsoft.com') && !u.includes('github.com') && !u.includes('schema.org'));
console.log('Unique URLs in nfa.exe:');
console.log(uniqueUrls);

console.log('\nSearching for steam api calls in nfa.exe:');
const matches = str.match(/[a-zA-Z0-9_]{3,30}(check|warranty|status|auth|token|verify)[a-zA-Z0-9_]{0,30}/gi) || [];
const filteredMatches = [...new Set(matches)].filter(m => m.length > 5 && m.length < 35).slice(0, 30);
console.log(filteredMatches);
