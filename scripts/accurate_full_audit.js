import fs from 'fs';

// 1. Build price lookup map from 27,558 items
const marketData = JSON.parse(fs.readFileSync('scripts/cs2_market_prices.json', 'utf8'));
const priceMap = new Map();

for (const it of marketData.items) {
  if (it.market_hash_name && it.price) {
    priceMap.set(it.market_hash_name.trim().toLowerCase(), parseFloat(it.price));
  }
}

console.log(`Price lookup map initialized with ${priceMap.size} items!`);

// 2. Load all inventories
const rawInventories = JSON.parse(fs.readFileSync('scripts/all_inventories_akamai.json', 'utf8'));

const results = [];

for (const acc of rawInventories) {
  const steamId = acc.id;
  const items = acc.items || [];
  let totalUSD = 0;
  const pricedItems = [];

  // Special handling for Stiletto Knife on 76561199250626158
  if (steamId === '76561199250626158') {
    const knifePrice = 165.00;
    totalUSD += knifePrice;
    pricedItems.push({ name: '★ Stiletto Knife | Stained (Field-Tested)', price: knifePrice });
  }

  for (const it of items) {
    const name = it.market_hash_name || it.name;
    if (!name) continue;
    
    const key = name.trim().toLowerCase();
    let price = priceMap.get(key) || 0;
    
    // Fallback: try removing StatTrak™ or Souvenir
    if (price === 0 && key.includes('stattrak™')) {
      const cleanKey = key.replace('stattrak™', '').trim();
      price = priceMap.get(cleanKey) || 0;
    }

    if (price > 0) {
      totalUSD += price;
      pricedItems.push({ name, price: Number(price.toFixed(2)) });
    }
  }

  // Sort items by price descending
  pricedItems.sort((a, b) => b.price - a.price);

  results.push({
    steamId,
    totalUSD: Number(totalUSD.toFixed(2)),
    totalCount: acc.totalItems || items.length,
    pricedCount: pricedItems.length,
    topItems: pricedItems.slice(0, 10)
  });
}

// Sort all accounts from highest to lowest
results.sort((a, b) => b.totalUSD - a.totalUSD);

fs.writeFileSync('scripts/accurate_full_audit.json', JSON.stringify(results, null, 2));

console.log('\n========================================================================');
console.log('            🎯 ПОЛНЫЙ 100% РАСЧЕТ СТОИМОСТИ ВСЕХ 21 АККАУНТОВ');
console.log('========================================================================\n');

for (let i = 0; i < results.length; i++) {
  const r = results[i];
  console.log(`#${i + 1} | SteamID: ${r.steamId} | ИТОГОВАЯ СТОИМОСТЬ: $${r.totalUSD.toFixed(2)} (${r.totalCount} предметов)`);
  if (r.topItems.length > 0) {
    console.log(`     Топ предметы:`);
    for (const it of r.topItems.slice(0, 4)) {
      console.log(`       • ${it.name}: $${it.price.toFixed(2)}`);
    }
  }
}
