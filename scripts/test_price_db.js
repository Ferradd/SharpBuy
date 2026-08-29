import fs from 'fs';

async function testPricingApis() {
  const sources = [
    'https://prices.csgotrader.app/latest/prices_v6.json',
    'https://market.csgo.com/api/v2/prices/USD.json',
    'https://api.pricempire.com/v1/public/items/csgo'
  ];

  for (const src of sources) {
    try {
      console.log(`Fetching from: ${src}...`);
      const res = await fetch(src, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Downloaded ${text.length} bytes!`);
        fs.writeFileSync('scripts/price_db.json', text);
        console.log('Saved to scripts/price_db.json!');
        break;
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

testPricingApis();
