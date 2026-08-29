import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

async function testWebAuditorEndpoint() {
  const token = tokenMatches[2]; // Account 3: 76561199250626158 with GTA V Legacy and CS2
  console.log('Testing /api/audit-single on localhost:3888 with token for', token.split('----')[0]);

  try {
    const res = await fetch('http://localhost:3888/api/audit-single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response success:', data.success);
    console.log('Account Games data:', data.account?.games);
    console.log('Commercial Summary:', data.account?.commercialSummary);
    console.log('Valuation:', data.account?.valuation);
  } catch (e) {
    console.log('Fetch error (server not running or port unreachable):', e.message);
  }
}

testWebAuditorEndpoint();
