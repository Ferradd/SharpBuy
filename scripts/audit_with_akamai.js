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

async function fetchInventory(id) {
  try {
    const res = await fetch(`https://steamcommunity-a.akamaihd.net/inventory/${id}/730/2?l=english&count=1000`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (res.status === 403) return { id, status: 'PRIVATE', items: [] };
    if (!res.ok) return { id, status: `HTTP_${res.status}`, items: [] };

    const data = await res.json();
    const descriptions = data.descriptions || [];
    const items = descriptions.map(d => ({
      name: d.market_name || d.name,
      type: d.type,
      market_hash_name: d.market_hash_name || d.market_name,
      icon: d.icon_url
    }));

    return {
      id,
      status: 'OK',
      totalItems: data.assets ? data.assets.length : items.length,
      items
    };
  } catch (e) {
    return { id, status: `ERROR_${e.message}`, items: [] };
  }
}

async function main() {
  console.log('Fetching inventories for all 21 accounts via Akamai CDN...\n');
  const results = [];

  for (let i = 0; i < steamIds.length; i++) {
    const id = steamIds[i];
    const res = await fetchInventory(id);
    results.push(res);
    console.log(`[${i + 1}/${steamIds.length}] ${id} -> Status: ${res.status}, Items: ${res.totalItems || 0}`);
    if (res.items && res.items.length > 0) {
      console.log(`   Top 3: ${res.items.slice(0, 3).map(x => x.name).join(' | ')}`);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  fs.writeFileSync('scripts/all_inventories_akamai.json', JSON.stringify(results, null, 2));
  console.log('\nSaved all inventories to scripts/all_inventories_akamai.json');
}

main();
