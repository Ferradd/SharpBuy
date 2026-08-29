import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function inspectWithDelay() {
  for (let i = 0; i < 3; i++) {
    const [steamid, jwt] = tokenMatches[i].split('----');
    console.log(`\nFetching Account #${i+1}: ${steamid}...`);
    try {
      const invRes = await fetch(`https://steamcommunity.com/inventory/${steamid}/730/2?l=english&count=2000`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': `https://steamcommunity.com/profiles/${steamid}/inventory/`,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      console.log('Status:', invRes.status);
      if (invRes.status === 200) {
        const inv = await invRes.json();
        console.log(`Descriptions: ${inv.descriptions?.length} items!`);
        inv.descriptions?.slice(0, 10).forEach(d => console.log(' ->', d.type, '|', d.market_name || d.name));
      } else {
        console.log('Response text:', (await invRes.text()).substring(0, 100));
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
    await sleep(800);
  }
}

inspectWithDelay();
