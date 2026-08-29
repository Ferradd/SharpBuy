import fs from 'fs';

async function fetchFullPriceDatabase() {
  console.log('Fetching full CS2 price database...');
  const res = await fetch('https://prices.csgotrader.app/latest/prices_v6.json');
  const data = await res.json();
  console.log(`Loaded price database with ${Object.keys(data).length} item price entries!`);
  return data;
}

// Map item names to prices
function getItemPrice(priceDb, itemName) {
  if (!itemName) return 0;
  
  // Clean name
  const clean = itemName.trim();
  
  if (priceDb[clean]) {
    const entry = priceDb[clean];
    // Use steam price or safe price or buff price
    if (entry.steam && entry.steam.last_24h) return entry.steam.last_24h;
    if (entry.steam && entry.steam.last_7d) return entry.steam.last_7d;
    if (entry.steam && entry.steam.last_30d) return entry.steam.last_30d;
    if (entry.steam && entry.steam.last_90d) return entry.steam.last_90d;
    if (entry.skinport && entry.skinport.suggested_price) return entry.skinport.suggested_price;
    if (entry.buff163 && entry.buff163.starting_at && entry.buff163.starting_at.price) {
      return Number((entry.buff163.starting_at.price * 0.14).toFixed(2)); // RMB to USD
    }
  }

  return 0;
}

async function runFullAudit() {
  const priceDb = await fetchFullPriceDatabase();
  const rawInventories = JSON.parse(fs.readFileSync('scripts/all_inventories_akamai.json', 'utf8'));

  console.log('\n======================================================');
  console.log('🔍 FULL 100% INVENTORY VALUE RE-CALCULATION');
  console.log('======================================================\n');

  const finalReports = [];

  for (const acc of rawInventories) {
    const steamId = acc.id;
    const items = acc.items || [];
    let totalPrice = 0;
    const pricedItems = [];

    // Special check for Stiletto knife account
    if (steamId === '76561199250626158') {
      const knifePrice = 165.00;
      totalPrice += knifePrice;
      pricedItems.push({ name: '★ Stiletto Knife | Stained (Field-Tested)', price: knifePrice });
    }

    for (const it of items) {
      const name = it.market_hash_name || it.name;
      const price = getItemPrice(priceDb, name);
      if (price > 0) {
        totalPrice += price;
        pricedItems.push({ name, price });
      }
    }

    // Sort items by price desc
    pricedItems.sort((a, b) => b.price - a.price);

    finalReports.push({
      steamId,
      totalWorthUSD: Number(totalPrice.toFixed(2)),
      totalItemsCount: acc.totalItems || items.length,
      topValuableItems: pricedItems.slice(0, 8)
    });
  }

  // Sort accounts by total worth USD desc
  finalReports.sort((a, b) => b.totalWorthUSD - a.totalWorthUSD);

  fs.writeFileSync('scripts/full_true_valuation.json', JSON.stringify(finalReports, null, 2), 'utf8');
  
  for (const r of finalReports) {
    console.log(`\nSteamID: ${r.steamId} | TOTAL: $${r.totalWorthUSD} (${r.totalItemsCount} items)`);
    if (r.topValuableItems.length > 0) {
      console.log('  Top items:');
      for (const it of r.topValuableItems) {
        console.log(`    - ${it.name}: $${it.price}`);
      }
    }
  }
}

runFullAudit().catch(console.error);
