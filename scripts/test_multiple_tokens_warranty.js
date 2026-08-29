import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

async function testAllTokensWarranty() {
  console.log(`Testing warranty check for ${tokenMatches.length} tokens...\n`);
  for (let i = 0; i < 5; i++) {
    const tok = tokenMatches[i];
    try {
      const res = await fetch('https://nfa.shefu223.shop/api/nfa-warranty-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: tok })
      });
      const data = await res.json();
      console.log(`[#${i+1}] ${tok.split('----')[0]}:`, data);
    } catch (e) {
      console.log(`[#${i+1}] Error:`, e.message);
    }
  }
}

testAllTokensWarranty();
