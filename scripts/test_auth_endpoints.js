import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g);
const firstTokenRaw = tokenMatches[0];
const [steamid, refreshToken] = firstTokenRaw.split('----');

async function testAuthEndpoints() {
  console.log('Testing refresh token auth methods for steamid:', steamid);

  // Method A: login.steampowered.com/jwt/refresh
  try {
    const form = new URLSearchParams({
      refresh_token: refreshToken,
      steamid: steamid
    });
    const res = await fetch('https://login.steampowered.com/jwt/refresh', {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    console.log('1. /jwt/refresh Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('1. /jwt/refresh Error:', e.message);
  }

  // Method B: IAuthenticationService/GenerateAccessTokenForApp with JSON body or form
  try {
    const form = new URLSearchParams({
      refresh_token: refreshToken,
      steamid: steamid,
      renewal_type: '1'
    });
    const res = await fetch(`https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/?refresh_token=${encodeURIComponent(refreshToken)}&steamid=${steamid}`);
    const data = await res.json();
    console.log('2. GenerateAccessTokenForApp GET Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('2. GenerateAccessTokenForApp GET Error:', e.message);
  }

  // Method C: IAuthenticationService/RenewAccessToken
  try {
    const form = new URLSearchParams({
      refresh_token: refreshToken
    });
    const res = await fetch('https://api.steampowered.com/IAuthenticationService/RenewAccessToken/v1/', {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    console.log('3. RenewAccessToken Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('3. RenewAccessToken Error:', e.message);
  }

  // Method D: Check steamcommunity profile / XML / JSON
  try {
    const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/?xml=1`);
    const xml = await res.text();
    console.log('4. Profile XML Status:', res.status, 'XML snippet:', xml.substring(0, 300));
  } catch (e) {
    console.log('4. Profile XML Error:', e.message);
  }
}

testAuthEndpoints();
