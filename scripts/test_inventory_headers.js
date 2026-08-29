import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

async function testInventoryScraping() {
  console.log(`Testing inventory and Steam badges across ${tokenMatches.length} accounts...`);

  for (let i = 0; i < Math.min(10, tokenMatches.length); i++) {
    const [steamid, jwt] = tokenMatches[i].split('----');

    // 1. Steam Badges & Level Page (HTML)
    try {
      const bRes = await fetch(`https://steamcommunity.com/profiles/${steamid}/badges/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const bHtml = await bRes.text();
      const levelMatch = bHtml.match(/class="friendPlayerLevelNum">(\d+)<\/span>/i) || bHtml.match(/persona_name persona_level">.*?(\d+)/is);
      const badgesCountMatch = bHtml.match(/badge_count">.*?(\d+)/is) || bHtml.match(/(\d+)\s+badges/i);
      const xpMatch = bHtml.match(/(\d+)\s+XP/i);

      console.log(`\n[Account #${i+1}] SteamID: ${steamid}`);
      console.log('   • Steam Level:', levelMatch ? levelMatch[1] : 'Hidden / Lv 0');
      console.log('   • XP:', xpMatch ? xpMatch[1] : 'N/A');
    } catch (e) {
      console.log('   • Badges error:', e.message);
    }

    // 2. CS2 Inventory with full headers
    try {
      const invRes = await fetch(`https://steamcommunity.com/inventory/${steamid}/730/2?l=english&count=2000`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': `https://steamcommunity.com/profiles/${steamid}/inventory/`,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      console.log('   • Inventory Status:', invRes.status);
      if (invRes.status === 200) {
        const inv = await invRes.json();
        console.log('   • Descriptions count:', inv.descriptions ? inv.descriptions.length : 0);
        console.log('   • Total inventory count:', inv.total_inventory_count || 0);
      }
    } catch (e) {
      console.log('   • Inventory error:', e.message);
    }
  }
}

testInventoryScraping();
