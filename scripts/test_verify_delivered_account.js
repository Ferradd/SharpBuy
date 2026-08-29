import { GamesInventoryCollector } from '../src/tools/steamAuditor/Collectors/GamesInventoryCollector.js';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';

async function checkDeliveredAccount() {
  const steamid = '76561199621492593';
  const profile = await SteamSessionEngine.fetchLiveProfile(steamid);
  const games = await GamesInventoryCollector.collectGamesLibrary(steamid);
  console.log('Delivered Account Profile:', profile);
  console.log('Delivered Account Games:', games);
}

checkDeliveredAccount();
