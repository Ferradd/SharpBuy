async function inspectSteam(steamId) {
  try {
    const res = await fetch(`https://steamcommunity.com/profiles/${steamId}/?xml=1`);
    const text = await res.text();
    const customUrl = text.match(/<customURL><!\[CDATA\[(.*?)\]\]><\/customURL>/)?.[1] || '';
    const steamID = text.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/)?.[1] || '';
    const stateMessage = text.match(/<stateMessage><!\[CDATA\[(.*?)\]\]><\/stateMessage>/)?.[1] || '';
    const privacy = text.match(/<privacyState>(.*?)<\/privacyState>/)?.[1] || '';
    console.log(`[SteamID: ${steamId}] Name: ${steamID}, Status: ${stateMessage}, Privacy: ${privacy}`);
  } catch (e) {
    console.log(`[SteamID: ${steamId}] Error:`, e.message);
  }
}

async function main() {
  await inspectSteam('76561199222229128');
  await inspectSteam('76561198308872864');
}

main();
