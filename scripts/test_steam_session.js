import fs from 'fs';

// Read first token from steam.txt or orders_database
const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g);

if (!tokenMatches || tokenMatches.length === 0) {
  console.error('No tokens found in steam.txt');
  process.exit(1);
}

const firstTokenRaw = tokenMatches[0];
console.log('Testing Token:', firstTokenRaw.substring(0, 40) + '...');

const [steamid, refreshToken] = firstTokenRaw.split('----');

console.log('SteamID:', steamid);
console.log('Refresh Token length:', refreshToken.length);

async function testSessionGeneration() {
  console.log('\n--- 1. Testing Steam IAuthenticationService/GenerateAccessTokenForApp ---');
  try {
    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('steamid', steamid);

    const res = await fetch('https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Valve/SteamHTTPClient 1.0.8.0'
      },
      body: params.toString()
    });

    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error on GenerateAccessTokenForApp:', err.message);
  }

  console.log('\n--- 2. Testing Direct Token in steamLoginSecure cookie ---');
  try {
    const directCookie = `steamLoginSecure=${steamid}%7C%7C${refreshToken};`;
    const res = await fetch('https://store.steampowered.com/account/', {
      headers: {
        'Cookie': directCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await res.text();
    console.log('Store Account Page Status:', res.status, 'HTML length:', html.length);
    const hasWallet = html.includes('accountData') || html.includes('account_name') || html.includes('your_account') || html.includes('account_balance');
    console.log('Has account data indicators:', hasWallet);
    const matchUser = html.match(/class="account_name">([^<]+)<\/span>/i) || html.match(/user_name">([^<]+)<\/span>/i);
    if (matchUser) {
      console.log('Logged in as user:', matchUser[1].trim());
    }
  } catch (err) {
    console.error('Error on direct cookie check:', err.message);
  }
}

testSessionGeneration();
