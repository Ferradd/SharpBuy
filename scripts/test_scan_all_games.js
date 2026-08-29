import fs from 'fs';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';
import { GamesInventoryCollector } from '../src/tools/steamAuditor/Collectors/GamesInventoryCollector.js';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

async function scanAllTokens() {
  console.log(`Scanning ${tokenMatches.length} accounts for games and inventories...`);
  
  for (let i = 0; i < tokenMatches.length; i++) {
    const raw = tokenMatches[i];
    const parsed = SteamSessionEngine.parseToken(raw);
    const profile = await SteamSessionEngine.fetchLiveProfile(parsed.steamid);
    const games = await GamesInventoryCollector.collectGamesLibrary(parsed.steamid);
    const dota2 = await GamesInventoryCollector.collectAppInventory(parsed.steamid, 570);
    const tf2 = await GamesInventoryCollector.collectAppInventory(parsed.steamid, 440);
    const rust = await GamesInventoryCollector.collectAppInventory(parsed.steamid, 252490);

    console.log(`[#${i + 1}] SteamID: ${parsed.steamid} | Nick: ${profile.nickname} | Public: ${profile.isPublic} | Games: ${games.totalGamesCount} | Rust Inv: ${rust.totalItems} | Dota2 Inv: ${dota2.totalItems} | TF2 Inv: ${tf2.totalItems}`);
    if (games.allGames && games.allGames.length > 0) {
      console.log('   Games found:', games.allGames.map(g => `${g.name} (${g.hours}h)`).join(', '));
    }
  }
}

scanAllTokens();
