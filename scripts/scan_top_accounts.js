import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

console.log(`Found ${tokenMatches.length} accounts. Scanning top 10 accounts...`);

async function scanAccounts() {
  for (let i = 0; i < Math.min(10, tokenMatches.length); i++) {
    const [steamid, jwt] = tokenMatches[i].split('----');
    try {
      const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/?xml=1`);
      const xml = await res.text();
      const nameMatch = xml.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);
      const privacyMatch = xml.match(/<privacyState>(.*?)<\/privacyState>/);
      const vacMatch = xml.match(/<vacBanned>(\d+)<\/vacBanned>/);
      const customUrlMatch = xml.match(/<customURL><!\[CDATA\[(.*?)\]\]><\/customURL>/);

      // Check games
      const gRes = await fetch(`https://steamcommunity.com/profiles/${steamid}/games/?tab=all&xml=1`);
      const gXml = await gRes.text();
      const games = [];
      const gameRegex = /<appID>(\d+)<\/appID>\s*<name><!\[CDATA\[(.*?)\]\]><\/name>(?:\s*<hoursOnRecord>([0-9.,]+)<\/hoursOnRecord>)?/g;
      let m;
      while ((m = gameRegex.exec(gXml)) !== null) {
        games.push({ name: m[2], hours: m[3] || '0' });
      }

      console.log(`\n[#${i+1}] SteamID: ${steamid} | Nick: "${nameMatch ? nameMatch[1] : '?'}" | Privacy: ${privacyMatch ? privacyMatch[1] : '?'} | VAC: ${vacMatch && vacMatch[1] === '1' ? 'BANNED ❌' : 'Clean ✅'} | Games: ${games.length}`);
      if (games.length > 0) {
        console.log('    Games:', games.map(g => `${g.name} (${g.hours}h)`).join(', '));
      }
    } catch (e) {
      console.log(`Error on #${i+1}:`, e.message);
    }
  }
}

scanAccounts();
