// Native fetch in Node 26

const deadToken = '76561199222229128----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIyMjIyOTEyOCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTMzNjkyNjcsICJuYmYiOiAxNzE0MjQ2MjkyLCAiaWF0IjogMTcyMjg4NjI5MiwgImp0aSI6ICIwRjdCXzI0RDMwQzNGX0VBN0VFIiwgIm9hdCI6IDE3MjI4ODYyOTIsICJnZW4iOiA0LCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMjEzLjE0Mi45Ny42MSIsICJpcF9jb25maXJtZXIiOiAiMjEzLjE0Mi45Ny42MSIgfQ.EUGCq4QxZQvowVxh5GWVwg6zLiVIeTzS0xXjnc8jjzRlOANB4in9t3fr6ia9_HQScmpdzs-0MQZqto8xeiYrDQ';
const goodToken = '76561199216635588----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIxNjYzNTU4OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDA4MDk4MzUsICJuYmYiOiAxNzczOTU1MDQyLCAiaWF0IjogMTc4MjU5NTA0MiwgImp0aSI6ICIwMDE0XzI4NjNFMzg2X0JEQ0RGIiwgIm9hdCI6IDE3ODI1OTUwNDIsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI4OC4yNDIuMTg1LjQ3IiwgImlwX2NvbmZpcm1lciI6ICI4OC4yNDIuMTg1LjQ3IiB9.U48kC2D0vY5z-1e-p24-tX716P-Lp9m429wV0N4kUjHw6b-w7Vp8d4Xy8b_t-zms7q7S-zIPRcALPZ33lahff10gCQ';

async function testValveAPIs(tokenStr, label) {
  const [steamid, refreshToken] = tokenStr.split('----');
  console.log(`\n=== Testing [${label}] ${steamid} ===`);

  // 1. IAuthenticationService/GetAuthTokensForAccount
  try {
    const form = new URLSearchParams();
    form.append('refresh_token', refreshToken);
    form.append('steamid', steamid);

    const r1 = await fetch('https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });
    console.log('GenerateAccessTokenForApp:', r1.status, await r1.text());
  } catch (e) {
    console.log('r1 err:', e.message);
  }

  // 2. Steam Login Session renewal: https://login.steampowered.com/jwt/refresh
  try {
    const form2 = new URLSearchParams();
    form2.append('redir', 'https://steamcommunity.com/login/home/?goto=');
    form2.append('refresh_token', refreshToken);

    const r2 = await fetch('https://login.steampowered.com/jwt/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form2.toString()
    });
    console.log('login.steampowered.com/jwt/refresh:', r2.status, await r2.text());
  } catch (e) {
    console.log('r2 err:', e.message);
  }
}

async function run() {
  await testValveAPIs(deadToken, 'DEAD TOKEN (76561199222229128)');
  await testValveAPIs(goodToken, 'GOOD TOKEN (76561199216635588)');
}

run();
