import { verifySteamLogon } from '../api/steam-verify.js';

const rawToken = process.argv[2];
if (!rawToken) {
  console.log(JSON.stringify({ isAlive: false, reason: 'No token passed' }));
  process.exit(0);
}

const cleanToken = rawToken.trim();
const parts = cleanToken.split('----');
const steamid = parts[0];
const refreshToken = parts[1] || parts[0];

verifySteamLogon(refreshToken, steamid).then((result) => {
  console.log(JSON.stringify(result));
  process.exit(0);
}).catch((err) => {
  console.log(JSON.stringify({ isAlive: false, reason: err.message, steamId: steamid }));
  process.exit(0);
});
