import fs from 'fs';

async function testMarket() {
  const urls = [
    'https://market.csgo.com/api/v2/prices/USD.json',
    'https://raw.githubusercontent.com/joshisaac/csgo-market-data/master/data.json',
    'https://api.skinport.com/v1/items?app_id=730&currency=USD'
  ];

  for (const u of urls) {
    try {
      console.log(`Trying ${u}...`);
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const json = await res.json();
        console.log(`Success! Type: ${Array.isArray(json) ? 'Array (' + json.length + ')' : 'Object (' + Object.keys(json).length + ')'}`);
        fs.writeFileSync('scripts/cs2_market_prices.json', JSON.stringify(json));
        break;
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

testMarket();
