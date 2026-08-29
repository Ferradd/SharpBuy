import fs from 'fs';
import { LoginSession, EAuthTokenPlatformType } from 'steam-session';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g);
const firstTokenRaw = tokenMatches[0];
const [steamid, refreshToken] = firstTokenRaw.split('----');

console.log('Testing Token with LoginSession for SteamID:', steamid);

async function testSession() {
  try {
    const session = new LoginSession(EAuthTokenPlatformType.SteamClient);
    session.refreshToken = refreshToken;

    console.log('Fetching web cookies via session.getWebCookies()...');
    const cookies = await session.getWebCookies();
    console.log('Web Cookies obtained successfully!');
    console.log('Cookies count:', cookies.length);
    console.log('Cookies list:', cookies.map(c => c.split('=')[0]));

    const cookieHeader = cookies.join('; ');

    // Test Store Account page
    const storeRes = await fetch('https://store.steampowered.com/account/', {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await storeRes.text();
    console.log('\n--- Store Account Response Status:', storeRes.status);
    
    // Check wallet balance in HTML
    const walletMatch = html.match(/class="accountData accountBalance">([^<]+)<\/div>/i) ||
                        html.match(/class="your_account">[^<]*<span class="account_balance">([^<]+)<\/span>/i) ||
                        html.match(/accountData[^\$€₽₺₸0-9]*([$€₽₺₸0-9,.\s]+)/i);
    console.log('Wallet match:', walletMatch ? walletMatch[1].trim() : 'Wallet info found/zero or regex need adjustment');

    // Check account name
    const nameMatch = html.match(/account_name">([^<]+)<\/span>/i) || html.match(/user_name">([^<]+)<\/span>/i);
    if (nameMatch) {
      console.log('Logged in Account Name:', nameMatch[1].trim());
    }

    // Check Steam points summary
    const pointsRes = await fetch('https://store.steampowered.com/pointssummary/ajaxgetasyncconfig', {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const pointsData = await pointsRes.json().catch(() => null);
    console.log('\n--- Steam Points Data:', pointsData ? JSON.stringify(pointsData) : 'No JSON');

  } catch (err) {
    console.error('LoginSession Error:', err);
  }
}

testSession();
