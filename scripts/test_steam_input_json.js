import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g);
const firstTokenRaw = tokenMatches[0];
const [steamid, refreshToken] = firstTokenRaw.split('----');

async function testInputJson() {
  console.log('Testing input_json on Steam Web API...');

  // Test 1: IAuthenticationService/GenerateAccessTokenForApp with input_json
  try {
    const inputJson = JSON.stringify({
      refresh_token: refreshToken,
      steamid: steamid
    });
    const form = new URLSearchParams({ input_json: inputJson });
    const res = await fetch('https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });
    const data = await res.json();
    console.log('1. input_json GenerateAccessTokenForApp Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('1. Error:', e.message);
  }

  // Test 2: IAuthenticationService/GetAuthTokenInfo with input_json
  try {
    const inputJson = JSON.stringify({
      access_token: refreshToken
    });
    const res = await fetch(`https://api.steampowered.com/IAuthenticationService/GetAuthTokenInfo/v1/?input_json=${encodeURIComponent(inputJson)}`);
    const data = await res.json();
    console.log('2. GetAuthTokenInfo Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('2. GetAuthTokenInfo Error:', e.message);
  }

  // Test 3: IAuthenticationService/GetAuthSessionInfo with input_json
  try {
    const inputJson = JSON.stringify({
      client_id: refreshToken
    });
    const res = await fetch(`https://api.steampowered.com/IAuthenticationService/GetAuthSessionInfo/v1/?input_json=${encodeURIComponent(inputJson)}`);
    const data = await res.json();
    console.log('3. GetAuthSessionInfo Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('3. GetAuthSessionInfo Error:', e.message);
  }
}

testInputJson();
