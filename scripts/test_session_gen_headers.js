import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];
const [steamid, jwt] = tokenMatches[0].split('----');

async function testWebSessionGen() {
  console.log('Testing Web Session for steamid:', steamid);

  // Let's test the Steam Community OpenID / session transfer with JWT
  const endpoints = [
    {
      url: 'https://login.steampowered.com/jwt/refresh',
      method: 'POST',
      body: new URLSearchParams({ refresh_token: jwt, steamid: steamid })
    },
    {
      url: `https://store.steampowered.com/login/jwtrefresh?refresh_token=${encodeURIComponent(jwt)}&steamid=${steamid}`,
      method: 'GET'
    },
    {
      url: 'https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/',
      method: 'POST',
      headers: {
        'Origin': 'https://steamcommunity.com',
        'Referer': 'https://steamcommunity.com/'
      },
      body: new URLSearchParams({
        refresh_token: jwt,
        steamid: steamid,
        renewal_type: '0'
      })
    }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: ep.headers,
        body: ep.body
      });
      const txt = await res.text();
      console.log(`[${ep.url}] Status ${res.status}:`, txt.substring(0, 300));
    } catch (e) {
      console.log(`[${ep.url}] Error:`, e.message);
    }
  }
}

testWebSessionGen();
