import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g);
const firstTokenRaw = tokenMatches[0];
const [steamid, refreshToken] = firstTokenRaw.split('----');

// Let's test the Steam web api GenerateAccessTokenForApp with exact protobuf JSON
async function testProtobuf() {
  const tests = [
    {
      name: 'IAuthenticationService/GenerateAccessTokenForApp/v1 (refresh_token param)',
      url: 'https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/',
      body: new URLSearchParams({ refresh_token: refreshToken, steamid: steamid }).toString()
    },
    {
      name: 'IAuthenticationService/GenerateAccessTokenForApp/v1 (input_json)',
      url: 'https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/',
      body: new URLSearchParams({ input_json: JSON.stringify({ refresh_token: refreshToken, steamid: steamid }) }).toString()
    },
    {
      name: 'IAuthenticationService/GenerateAccessTokenForApp/v1 (json body)',
      url: 'https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken, steamid: steamid })
    },
    {
      name: 'login.steampowered.com/jwt/refresh with access_token',
      url: 'https://login.steampowered.com/jwt/refresh',
      body: new URLSearchParams({ refresh_token: refreshToken }).toString()
    }
  ];

  for (const t of tests) {
    try {
      const res = await fetch(t.url, {
        method: 'POST',
        headers: t.headers || { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: t.body
      });
      const txt = await res.text();
      console.log(`[${t.name}] Status ${res.status}:`, txt.substring(0, 200));
    } catch (e) {
      console.log(`[${t.name}] Error:`, e.message);
    }
  }
}

testProtobuf();
