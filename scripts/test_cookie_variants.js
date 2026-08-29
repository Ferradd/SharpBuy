import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];
const [steamid, jwt] = tokenMatches[0].split('----');

async function testCookies() {
  const cookieVariants = [
    `steamLoginSecure=${steamid}%7C%7C${jwt}; sessionid=1234567890abcdef`,
    `steamLoginSecure=${jwt}; sessionid=1234567890abcdef`,
    `steamRememberLogin=${steamid}%7C%7C${jwt}; sessionid=1234567890abcdef`
  ];

  for (let i = 0; i < cookieVariants.length; i++) {
    const cookie = cookieVariants[i];
    console.log(`\nTesting Cookie Variant #${i+1}...`);
    try {
      const res = await fetch('https://steamcommunity.com/my/edit', {
        headers: {
          'Cookie': cookie,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        redirect: 'manual'
      });

      console.log('Status:', res.status);
      console.log('Location:', res.headers.get('location'));
      const html = await res.text();
      console.log('HTML snippet:', html.substring(0, 200));
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

testCookies();
