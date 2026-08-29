import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

async function inspectProfileGames(steamid) {
  console.log(`\n================ Inspecting ${steamid} ================`);
  
  // 1. Profile HTML
  try {
    const pRes = await fetch(`https://steamcommunity.com/profiles/${steamid}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const pHtml = await pRes.text();
    console.log('Profile status:', pRes.status, 'HTML len:', pHtml.length);
    
    // Check games count link: href=".../games/?tab=all">Games <span class="profile_count_link_total"> N </span>
    const gamesCountMatch = pHtml.match(/href="[^"]*\/games\/[^"]*">\s*Games\s*<span[^>]*class="profile_count_link_total"[^>]*>\s*(\d+)\s*<\/span>/i) ||
                            pHtml.match(/profile_count_link_total">\s*(\d+)\s*<\/span>/i) ||
                            pHtml.match(/Games\s*<span class="count">(\d+)<\/span>/i);
    console.log('Profile games count match:', gamesCountMatch ? gamesCountMatch[1] : 'NOT FOUND');

    // Check recent games: <div class="recent_game">
    const recentGames = [...pHtml.matchAll(/class="game_name">\s*<a[^>]*>([^<]+)<\/a>/gi)].map(m => m[1]);
    console.log('Recent games in profile HTML:', recentGames);

    // Check hours in recent games
    const recentHours = [...pHtml.matchAll(/([0-9.,]+)\s*hrs on record/gi)].map(m => m[1]);
    console.log('Recent hours:', recentHours);
  } catch (e) {
    console.log('Profile HTML error:', e.message);
  }

  // 2. Badges HTML
  try {
    const bRes = await fetch(`https://steamcommunity.com/profiles/${steamid}/badges/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const bHtml = await bRes.text();
    // Check Game Collector badge or game card rows
    // e.g. "badge_info_description">... 50 games owned ...
    const collectorMatch = bHtml.match(/(\d+)\s+games\s+owned/i) || bHtml.match(/badge_info_description">\s*(\d+)\s+games/i);
    console.log('Badges Game Collector match:', collectorMatch ? collectorMatch[1] : 'NOT FOUND');

    // Check game names with badges
    const badgeGames = [...bHtml.matchAll(/href="https:\/\/steamcommunity\.com\/app\/(\d+)"/g)].map(m => m[1]);
    console.log('Badge appids:', [...new Set(badgeGames)]);
  } catch (e) {
    console.log('Badges error:', e.message);
  }

  // 3. Games XML
  try {
    const xRes = await fetch(`https://steamcommunity.com/profiles/${steamid}/games/?tab=all&xml=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const xml = await xRes.text();
    console.log('XML snippet (first 200 chars):', xml.slice(0, 200));
  } catch (e) {
    console.log('XML error:', e.message);
  }
}

async function testAll() {
  const ids = tokenMatches.slice(0, 4).map(t => t.split('----')[0]);
  for (const id of ids) {
    await inspectProfileGames(id);
  }
}

testAll();
