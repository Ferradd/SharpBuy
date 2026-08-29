import fs from 'fs';
import { CommercialTitlesCatalog } from '../src/tools/steamAuditor/Collectors/CommercialTitlesCatalog.js';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

async function parseAllProfiles() {
  console.log(`Parsing games and hours from Profile HTML for ${tokenMatches.length} accounts...\n`);

  for (let i = 0; i < tokenMatches.length; i++) {
    const raw = tokenMatches[i];
    const steamid = raw.split('----')[0];

    try {
      const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      const html = await res.text();

      // Nickname
      const nickMatch = html.match(/<span class="actual_persona_name">([^<]+)<\/span>/i) || html.match(/<title>Steam Community :: ([^<]+)<\/title>/i);
      const nickname = nickMatch ? nickMatch[1].trim() : 'Unknown';

      // Total games count
      const totalGamesMatch = html.match(/href="[^"]*\/games\/[^"]*">\s*Games\s*<span[^>]*class="profile_count_link_total"[^>]*>\s*(\d+)\s*<\/span>/i) ||
                              html.match(/profile_count_link_total">\s*(\d+)\s*<\/span>/i);
      const totalGamesCount = totalGamesMatch ? parseInt(totalGamesMatch[1], 10) : 0;

      // Recent games
      const recentGameBlocks = html.split('<div class="recent_game">').slice(1);
      const games = [];
      let totalHours = 0;

      for (const block of recentGameBlocks) {
        const nameMatch = block.match(/class="game_name">\s*<a[^>]*>([^<]+)<\/a>/i);
        const appidMatch = block.match(/href="https:\/\/steamcommunity\.com\/app\/(\d+)"/i) || block.match(/app\/(\d+)/i);
        const hoursMatch = block.match(/([0-9.,]+)\s*hrs on record/i);

        if (nameMatch) {
          const name = nameMatch[1].trim();
          const appid = appidMatch ? appidMatch[1] : null;
          const rawHours = hoursMatch ? parseFloat(hoursMatch[1].replace(/,/g, '')) : 0;
          const hours = isNaN(rawHours) ? 0 : rawHours;
          totalHours += hours;

          const commMatch = CommercialTitlesCatalog.matchGame(appid, name);
          games.push({
            name,
            appid,
            hours,
            isCommercial: Boolean(commMatch),
            commercialMeta: commMatch
          });
        }
      }

      console.log(`[#${i + 1}] SteamID: ${steamid} | Nick: "${nickname}" | Всего игр в библиотеке: ${totalGamesCount} | Игровой стаж: ${totalHours.toFixed(1)}ч`);
      if (games.length > 0) {
        console.log('   Игры:', games.map(g => `${g.name} (${g.hours}ч)${g.isCommercial ? ` [${g.commercialMeta?.badgeLabel || 'COMMERCIAL'}]` : ''}`).join(', '));
      }
    } catch (e) {
      console.log(`[#${i + 1}] Error for ${steamid}: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 400));
  }
}

parseAllProfiles();
