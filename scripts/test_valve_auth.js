import fs from 'fs';

const steamTxtPath = 'C:\\Users\\iliyk\\Desktop\\steam.txt';
const steamTxt = fs.readFileSync(steamTxtPath, 'utf8');
const allTokens = [...new Set(steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [])];

console.log('Testing Valve Steam Auth Protocol on tokens...\n');

// In Steam NFA tokens, the JWT is an OAuth Refresh Token generated for Steam Client (aud: ["client", "web", "renew", "derive"])
// To check if Valve has revoked the token, we call Steam AuthenticationService via Web API:
// https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/
// with refresh_token and steamid.

async function testValveAuthRevocation(tokenStr) {
  const [steamid, refreshToken] = tokenStr.split('----');
  
  const form = new URLSearchParams();
  form.append('refresh_token', refreshToken);
  form.append('steamid', steamid);

  try {
    const res = await fetch('https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    });

    const data = await res.json().catch(() => null);
    return {
      status: res.status,
      data
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function testTokens() {
  for (let i = 0; i < 5; i++) {
    const t = allTokens[i];
    const sid = t.split('----')[0];
    const res = await testValveAuthRevocation(t);
    console.log(`[${sid}] Valve Auth Response:`, JSON.stringify(res));
  }
}

testTokens();
