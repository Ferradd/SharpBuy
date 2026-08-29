import fs from 'fs';

const steamIds = [
  '76561199222229128',
  '76561198308872864',
  '76561199250626158',
  '76561197994572241',
  '76561199188317738',
  '76561199773433845',
  '76561198077834073',
  '76561199151675753',
  '76561199241484983',
  '76561199231692149',
  '76561199230983883',
  '76561199492828421',
  '76561199216635588',
  '76561199787712068',
  '76561199697754827',
  '76561199166963438',
  '76561199489633318',
  '76561199501030638',
  '76561199168590117',
  '76561198001838422',
  '76561199388981206'
];

async function checkAccountInventory(id) {
  try {
    const url = `https://steamcommunity.com/inventory/${id}/730/2?l=english&count=5000`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (res.status === 403) {
      return { id, status: 'PRIVATE / HIDDEN', items: [] };
    }
    if (!res.ok) {
      return { id, status: `HTTP_${res.status}`, items: [] };
    }

    const data = await res.json();
    if (!data || !data.descriptions) {
      return { id, status: 'EMPTY_OR_NOT_FOUND', items: [] };
    }

    // Map items
    const descriptions = data.descriptions || [];
    const assets = data.assets || [];
    
    // Count items and get market names
    const items = descriptions.map(d => ({
      name: d.market_name || d.name,
      type: d.type,
      marketable: d.marketable === 1,
      tradable: d.tradable === 1,
      icon: d.icon_url
    }));

    return { id, status: 'SUCCESS', count: assets.length, items };
  } catch (e) {
    return { id, status: `ERROR: ${e.message}`, items: [] };
  }
}

async function getPrice(marketName) {
  try {
    const encoded = encodeURIComponent(marketName);
    const res = await fetch(`https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encoded}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          lowest_price: data.lowest_price,
          median_price: data.median_price
        };
      }
    }
  } catch (e) {}
  return null;
}

async function run() {
  console.log(`Starting Inventory & Price audit for ${steamIds.length} accounts...\n`);
  const results = [];

  for (let i = 0; i < steamIds.length; i++) {
    const id = steamIds[i];
    console.log(`[${i + 1}/${steamIds.length}] Checking SteamID: ${id}...`);
    const inv = await checkAccountInventory(id);
    results.push(inv);
    console.log(`   -> Status: ${inv.status}, Items Count: ${inv.count || 0}`);
    if (inv.items && inv.items.length > 0) {
      console.log(`   -> Top items:`, inv.items.slice(0, 5).map(it => it.name).join(', '));
    }
    // Rate limit delay
    await new Promise(r => setTimeout(r, 1200));
  }

  fs.writeFileSync('scripts/inventory_audit_raw.json', JSON.stringify(results, null, 2));
  console.log('\nFinished fetching inventories! Saved to scripts/inventory_audit_raw.json');
}

run();
