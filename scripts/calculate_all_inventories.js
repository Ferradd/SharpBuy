import fs from 'fs';

// Load inventories retrieved
const raw = JSON.parse(fs.readFileSync('scripts/all_inventories_akamai.json', 'utf8'));

// We also know:
// 76561199250626158 has ★ Stiletto Knife | Stained (Field-Tested) worth ~$165.00
// 76561198308872864 has 10 Year Veteran Coin + cases
// 76561199222229128 has 146 items (Nova Rising Sun, Deagle Serpent Strike, M4A4 Choppa, etc.)

async function getSteamPrice(marketHashName) {
  try {
    const url = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(marketHashName)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.lowest_price) {
        const val = parseFloat(data.lowest_price.replace('$', '').replace(',', ''));
        return val || 0;
      }
    }
  } catch (e) {}
  return 0;
}

async function evaluateAll() {
  console.log('Calculating inventory values for all accounts...\n');

  const evaluated = [];

  for (const acc of raw) {
    const steamId = acc.id;
    let totalWorth = 0;
    const items = acc.items || [];
    
    // Special known items
    if (steamId === '76561199250626158') {
      // Stiletto Knife Stained FT = ~$165.00
      totalWorth += 165.00;
    }

    console.log(`Analyzing SteamID ${steamId} (${items.length} items)...`);
    
    // Check top valuable items for this account
    for (let i = 0; i < Math.min(items.length, 15); i++) {
      const item = items[i];
      if (item && item.market_hash_name) {
        const price = await getSteamPrice(item.market_hash_name);
        totalWorth += price;
        await new Promise(r => setTimeout(r, 400));
      }
    }

    evaluated.push({
      steamId,
      totalWorth: Number(totalWorth.toFixed(2)),
      itemCount: acc.totalItems || items.length,
      topItems: items.slice(0, 5).map(x => x.name)
    });
  }

  fs.writeFileSync('scripts/evaluated_totals.json', JSON.stringify(evaluated, null, 2));
  console.log('\nFinished evaluation! Results:', evaluated);
}

evaluateAll();
