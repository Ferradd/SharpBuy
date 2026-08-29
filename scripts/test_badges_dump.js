import fs from 'fs';

async function dumpBadgesPage() {
  const steamid = '76561198308872864';
  const url = `https://steamcommunity.com/profiles/${steamid}/badges/`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });

  const html = await res.text();
  const badgeMatches = [...html.matchAll(/badge_row/g)];
  console.log('badge_row matches:', badgeMatches.length);
  const titleMatches = [...html.matchAll(/badge_info_title">([^<]+)</g)].map(m => m[1].trim());
  console.log('badge_info_title:', titleMatches);

  const gameLinks = [...html.matchAll(/href="([^"]*(?:app|gamecards)[^"]*)"/g)].map(m => m[1]);
  console.log('gameLinks:', gameLinks);
}

dumpBadgesPage();
