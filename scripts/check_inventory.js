async function checkInventory(steamId) {
  try {
    const res = await fetch(`https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=50`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const items = data.descriptions?.map(d => d.market_name) || [];
      console.log(`[SteamID: ${steamId}] Items (${items.length}):`, items.slice(0, 10));
    } else {
      console.log(`[SteamID: ${steamId}] Inv status: ${res.status}`);
    }
  } catch (e) {
    console.log(`[SteamID: ${steamId}] Inv error:`, e.message);
  }
}

async function main() {
  await checkInventory('76561199222229128');
  await checkInventory('76561198308872864');
}

main();
