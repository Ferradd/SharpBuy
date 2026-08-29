import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

async function testFreshAuditor() {
  console.log('--- Testing Account #3 (GTA V & Mafia DE) ---');
  const res3 = await fetch('http://localhost:3888/api/audit-single', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: tokenMatches[2] })
  });
  const data3 = await res3.json();
  console.log('Account #3 Games:', data3.account?.games);
  console.log('Account #3 Commercial Summary:', data3.account?.commercialSummary);
  console.log('Account #3 Badges:', data3.account?.valuation?.badges);

  console.log('\n--- Testing Account #4 (Cyberpunk 2077 & Squad) ---');
  const res4 = await fetch('http://localhost:3888/api/audit-single', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: tokenMatches[3] })
  });
  const data4 = await res4.json();
  console.log('Account #4 Games:', data4.account?.games);
  console.log('Account #4 Commercial Summary:', data4.account?.commercialSummary);
  console.log('Account #4 Badges:', data4.account?.valuation?.badges);
}

testFreshAuditor();
