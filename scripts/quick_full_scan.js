import fs from 'fs';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';
import { CS2FaceitCollector } from '../src/tools/steamAuditor/Collectors/CS2FaceitCollector.js';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

console.log(`Scanning all ${tokenMatches.length} accounts for inventory / faceit...`);

async function fullScan() {
  for (let i = 0; i < tokenMatches.length; i++) {
    const raw = tokenMatches[i];
    const parsed = SteamSessionEngine.parseToken(raw);
    const cs2 = await CS2FaceitCollector.collectCS2Inventory(parsed.steamid);
    const faceit = await CS2FaceitCollector.collectFaceit(parsed.steamid);
    if (cs2.isInventoryPublic || faceit.registered) {
      console.log(`🔥 Match on Account #${i+1} [${parsed.steamid}]: CS2 Items: ${cs2.totalItems}, Medals: ${cs2.medalsCount}, Faceit: ${faceit.registered ? `Lvl ${faceit.level}` : 'No'}`);
    }
  }
  console.log('Scan completed.');
}

fullScan();
