async function testInventoryApis() {
  const steamId = '76561199222229128';

  const testUrls = [
    `https://csgobackpack.net/api/GetInventory/?id=${steamId}`,
    `https://csgobackpack.net/api/GetInventory/?id=${steamId}&app=730`,
    `https://inventory.rawg.io/steam/${steamId}/730/2`,
    `https://api.steamwebapi.com/v2/items?key=demo&steam_id=${steamId}`,
    `https://steamcommunity-a.akamaihd.net/inventory/${steamId}/730/2?l=english&count=500`
  ];

  for (const url of testUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`URL: ${url} -> Status: ${res.status}`);
      const text = await res.text();
      console.log(`Response Preview:`, text.slice(0, 300));
    } catch (e) {
      console.log(`URL: ${url} -> Error:`, e.message);
    }
  }
}

testInventoryApis();
