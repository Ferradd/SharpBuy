import fs from 'fs';
import { LoginSession, EAuthTokenPlatformType } from 'steam-session';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g);

async function testAllPlatforms() {
  const platforms = [
    { name: 'SteamClient (1)', val: EAuthTokenPlatformType.SteamClient },
    { name: 'WebBrowser (2)', val: EAuthTokenPlatformType.WebBrowser },
    { name: 'MobileApp (3)', val: EAuthTokenPlatformType.MobileApp }
  ];

  // Try on a couple of tokens to test if tokens are fresh or platform-specific
  for (let i = 0; i < Math.min(3, tokenMatches.length); i++) {
    const [steamid, refreshToken] = tokenMatches[i].split('----');
    console.log(`\n================ Testing Token #${i+1} [SteamID: ${steamid}] ================`);

    for (const p of platforms) {
      try {
        const session = new LoginSession(p.val);
        session.refreshToken = refreshToken;
        console.log(`Trying platform: ${p.name}...`);
        const cookies = await session.getWebCookies();
        console.log(`SUCCESS with ${p.name}! Cookies:`, cookies);
        return; // found working!
      } catch (err) {
        console.log(`Failed ${p.name}: ${err.message} (eresult: ${err.eresult})`);
      }
    }
  }
}

testAllPlatforms();
