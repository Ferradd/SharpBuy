import fs from 'fs';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

async function testGamesRetrieval() {
  const token = tokenMatches[0];
  const parsed = SteamSessionEngine.parseToken(token);
  console.log('Testing with steamid:', parsed.steamid);

  // Method 1: Web API GetOwnedGames with access_token
  try {
    const url1 = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?access_token=${parsed.jwt}&steamid=${parsed.steamid}&include_appinfo=1&include_played_free_games=1`;
    const res1 = await fetch(url1, { headers: { 'User-Agent': 'Valve/Steam' } });
    console.log('Method 1 (GetOwnedGames access_token) status:', res1.status);
    const data1 = await res1.json();
    console.log('Method 1 games count:', data1?.response?.game_count, 'games sample:', data1?.response?.games?.slice(0, 3));
  } catch (e) {
    console.log('Method 1 error:', e.message);
  }

  // Method 2: Steam Community XML with session cookie
  try {
    const url2 = `https://steamcommunity.com/profiles/${parsed.steamid}/games/?tab=all&xml=1`;
    const res2 = await fetch(url2, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Cookie': `steamLoginSecure=${parsed.steamid}%7C%7C${parsed.jwt}`
      }
    });
    console.log('Method 2 (Community XML with cookie) status:', res2.status);
    const xml = await res2.text();
    const countMatch = xml.match(/<gameCount>(\d+)<\/gameCount>/) || xml.match(/<appID>/g);
    console.log('Method 2 games matches:', countMatch ? countMatch.length : 0);
  } catch (e) {
    console.log('Method 2 error:', e.message);
  }
}

testGamesRetrieval();
