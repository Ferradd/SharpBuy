import fs from 'fs';

async function dumpGamesTab(steamid) {
  console.log(`\n================ Dumping games tab for ${steamid} ================`);
  const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/games/?tab=all`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const html = await res.text();
  console.log('Status:', res.status, 'HTML length:', html.length);
  
  // Check rgGames in script
  const rgGamesMatch = html.match(/var rgGames\s*=\s*(\[.*?\]);/s);
  if (rgGamesMatch) {
    try {
      const games = JSON.parse(rgGamesMatch[1]);
      console.log('rgGames parsed successfully! Total games:', games.length);
      console.log('Sample games:', games.slice(0, 5).map(g => `${g.name} (${g.appid}) - ${g.hours_forever || 0}h`));
    } catch (e) {
      console.log('rgGames parse error:', e.message);
    }
  } else {
    console.log('rgGames not found in HTML. Checking alternative variables...');
    const scriptVars = [...html.matchAll(/var\s+([a-zA-Z0-9_]+)\s*=/g)].map(m => m[1]);
    console.log('Found script vars:', scriptVars);
  }
}

async function test() {
  await dumpGamesTab('76561199188317738');
  await dumpGamesTab('76561199250626158');
}

test();
