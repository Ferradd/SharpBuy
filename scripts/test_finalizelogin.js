import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g);
const firstTokenRaw = tokenMatches[0];
const [steamid, refreshToken] = firstTokenRaw.split('----');

async function testFinalizeLogin() {
  console.log('Testing finalize login endpoints with refresh token...');

  // Endpoint 1: https://login.steampowered.com/jwt/finalizelogin
  try {
    const form = new URLSearchParams();
    form.append('nonce', refreshToken);
    form.append('sessionid', '1234567890abcdef');
    form.append('redir', 'https://store.steampowered.com/account/');

    const res = await fetch('https://login.steampowered.com/jwt/finalizelogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://login.steampowered.com',
        'Referer': 'https://login.steampowered.com/'
      },
      body: form.toString()
    });

    const setCookie = res.headers.get('set-cookie');
    console.log('1. finalizelogin Status:', res.status);
    console.log('1. Set-Cookie:', setCookie);
    const data = await res.json().catch(() => null);
    console.log('1. JSON:', data);
  } catch (e) {
    console.log('1. Error:', e.message);
  }

  // Endpoint 2: https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/
  // Let's test with protobuf JSON
  try {
    const input = {
      refresh_token: refreshToken,
      steamid: steamid
    };
    const res = await fetch('https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `input_json=${encodeURIComponent(JSON.stringify(input))}&access_token=${refreshToken}`
    });
    console.log('2. GenerateAccessToken with Bearer status:', res.status);
    console.log('2. Response:', await res.text());
  } catch (e) {
    console.log('2. Error:', e.message);
  }
}

testFinalizeLogin();
