import fs from 'fs';

async function testBadgesPage() {
  const steamid = '76561198308872864';
  const url = `https://steamcommunity.com/profiles/${steamid}/badges/`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });

  const html = await res.text();
  console.log('Badges page status:', res.status, 'HTML length:', html.length);
  const gamecardMatches = [...html.matchAll(/gamecards\/(\d+)\//g)].map(m => m[1]);
  console.log('Gamecard appids found:', [...new Set(gamecardMatches)]);

  const badgeRowTitles = [...html.matchAll(/badge_title">([^<]+)<\/div>/g)].map(m => m[1].trim());
  console.log('Badge titles:', badgeRowTitles);
}

testBadgesPage();
