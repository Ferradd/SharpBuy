import fs from 'fs';

async function inspectHtmlStructure(steamid) {
  const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const html = await res.text();
  fs.writeFileSync(`scripts/sample_profile_${steamid}.html`, html, 'utf8');
  console.log(`Saved sample_profile_${steamid}.html`);

  const gamesRes = await fetch(`https://steamcommunity.com/profiles/${steamid}/games/?tab=all`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  const gamesHtml = await gamesRes.text();
  fs.writeFileSync(`scripts/sample_games_${steamid}.html`, gamesHtml, 'utf8');
  console.log(`Saved sample_games_${steamid}.html`);
}

inspectHtmlStructure('76561199188317738');
