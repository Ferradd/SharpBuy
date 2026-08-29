async function testSteamCommunityItems() {
  const steamid = '76561198308872864';
  try {
    const res = await fetch(`https://steamcommunity.com/inventory/${steamid}/753/6?l=english&count=500`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log('Steam cards inventory status:', res.status);
    if (res.status === 200) {
      const data = await res.json();
      console.log('Cards count:', data.total_inventory_count, 'descriptions:', data.descriptions?.length);
      const apps = [...new Set(data.descriptions?.map(d => `${d.market_fee_app}: ${d.type} - ${d.name}`))];
      console.log('Apps with cards:', apps);
    }
  } catch (e) {
    console.log('Cards error:', e.message);
  }
}

testSteamCommunityItems();
