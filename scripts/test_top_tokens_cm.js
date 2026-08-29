import SteamUser from 'steam-user';
import fs from 'fs';

const steamTxtPath = 'C:\\Users\\iliyk\\Desktop\\steam.txt';
const steamTxt = fs.readFileSync(steamTxtPath, 'utf8');
const allTokens = [...new Set(steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [])];

console.log(`Testing all ${allTokens.length} tokens against Steam CM network...\n`);

async function testSingle(tokenStr, i) {
  const [steamid, refreshToken] = tokenStr.split('----');
  
  return new Promise((resolve) => {
    const client = new SteamUser();
    
    const timer = setTimeout(() => {
      client.logOff();
      resolve({ steamid, status: 'TIMEOUT' });
    }, 4000);

    client.logOn({ refreshToken });

    client.on('loggedOn', () => {
      clearTimeout(timer);
      client.logOff();
      console.log(`✅ [#${i+1}] ${steamid}: LOGON SUCCESS!`);
      resolve({ steamid, status: 'LOGON_SUCCESS' });
    });

    client.on('error', (err) => {
      clearTimeout(timer);
      console.log(`❌ [#${i+1}] ${steamid}: ${err.message} (EResult: ${err.eresult})`);
      resolve({ steamid, status: err.message, eresult: err.eresult });
    });
  });
}

async function runAll() {
  const results = [];
  for (let i = 0; i < Math.min(10, allTokens.length); i++) {
    const r = await testSingle(allTokens[i], i);
    results.push(r);
  }
}

runAll();
