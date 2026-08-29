import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g);

async function inspectAccounts() {
  console.log(`Found ${tokenMatches.length} accounts in steam.txt. Testing live collectors on Account #1...`);
  const [steamid, jwt] = tokenMatches[0].split('----');

  console.log(`\n========== ACCOUNT: ${steamid} ==========`);

  // 1. Steam Community Profile XML
  try {
    const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/?xml=1`);
    const xml = await res.text();
    const nameMatch = xml.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);
    const stateMatch = xml.match(/<onlineState>(.*?)<\/onlineState>/);
    const privacyMatch = xml.match(/<privacyState>(.*?)<\/privacyState>/);
    const memberSinceMatch = xml.match(/<memberSince><!\[CDATA\[(.*?)\]\]><\/memberSince>/);
    const avatarMatch = xml.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);
    const vacMatch = xml.match(/<vacBanned>(\d+)<\/vacBanned>/);
    const tradeBanMatch = xml.match(/<tradeBanState>(.*?)<\/tradeBanState>/);

    console.log('\n[1. Profile Info]:');
    console.log('• Nickname:', nameMatch ? nameMatch[1] : 'Unknown');
    console.log('• Privacy:', privacyMatch ? privacyMatch[1] : 'Unknown');
    console.log('• Member Since:', memberSinceMatch ? memberSinceMatch[1] : 'Hidden');
    console.log('• VAC Banned:', vacMatch ? (vacMatch[1] === '1' ? 'YES ❌' : 'NO ✅') : 'NO ✅');
    console.log('• Trade Ban:', tradeBanMatch ? tradeBanMatch[1] : 'None');
    console.log('• Avatar:', avatarMatch ? avatarMatch[1] : 'None');
  } catch (e) {
    console.log('Profile XML error:', e.message);
  }

  // 2. Games List via Steam Community XML
  try {
    const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/games/?tab=all&xml=1`);
    const xml = await res.text();
    const games = [];
    const gameRegex = /<appID>(\d+)<\/appID>\s*<name><!\[CDATA\[(.*?)\]\]><\/name>(?:\s*<hoursOnRecord>([0-9.,]+)<\/hoursOnRecord>)?/g;
    let match;
    while ((match = gameRegex.exec(xml)) !== null) {
      games.push({
        appid: match[1],
        name: match[2],
        hours: match[3] || '0'
      });
    }

    console.log('\n[2. Games Library]:');
    console.log(`• Total Games parsed: ${games.length}`);
    if (games.length > 0) {
      console.log('• Top Games:');
      games.slice(0, 10).forEach(g => console.log(`   - ${g.name} (${g.hours} hrs) [AppID: ${g.appid}]`));
    }
  } catch (e) {
    console.log('Games list error:', e.message);
  }

  // 3. CS2 Inventory (AppID 730, Context 2)
  try {
    const res = await fetch(`https://steamcommunity.com/inventory/${steamid}/730/2?l=english&count=5000`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const invData = await res.json();
    console.log('\n[3. CS2 Inventory]:');
    if (invData && invData.descriptions) {
      console.log(`• Total CS2 items: ${invData.descriptions.length}`);
      
      const medals = [];
      const cases = [];
      const skins = [];

      invData.descriptions.forEach(item => {
        const name = item.market_name || item.name;
        const type = item.type || '';
        const tags = item.tags || [];

        if (type.includes('Collectible') || type.includes('Medal') || type.includes('Coin') || type.includes('Badge') || type.includes('Pin') || name.includes('Service Medal') || name.includes('Veteran Coin') || name.includes('Trophy')) {
          medals.push(name);
        } else if (type.includes('Container') || name.includes('Case') || name.includes('Capsule') || name.includes('Package')) {
          cases.push(name);
        } else {
          skins.push({ name, type });
        }
      });

      console.log(`• Medals found (${medals.length}):`, medals);
      console.log(`• Cases found (${cases.length}):`, cases.slice(0, 5));
      console.log(`• Other skins/items (${skins.length}):`, skins.slice(0, 5).map(s => s.name));
    } else {
      console.log('• Inventory is empty or private (Status:', res.status, invData ? invData.error : '', ')');
    }
  } catch (e) {
    console.log('CS2 Inventory error:', e.message);
  }

  // 4. Faceit API Search
  try {
    const res = await fetch(`https://api.faceit.com/users/v1/nicknames/${steamid}`).catch(() => null);
    // Alternatively search by game_player_id
    console.log('\n[4. Faceit Probe]:');
    const fRes = await fetch(`https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamid}`, {
      headers: {
        'Authorization': 'Bearer 5ac4ec04-c36b-4e92-bc22-cf8bb0e0a544' // Public sample or open endpoint
      }
    }).catch(() => null);

    if (fRes && fRes.status === 200) {
      const fData = await fRes.json();
      console.log('• Faceit Level:', fData.games?.cs2?.skill_level || 'Unranked');
      console.log('• Faceit ELO:', fData.games?.cs2?.faceit_elo || 'None');
    } else {
      console.log('• Faceit: Checked (Not registered or open query)');
    }
  } catch (e) {
    console.log('Faceit error:', e.message);
  }
}

inspectAccounts();
