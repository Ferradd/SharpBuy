async function testAuthTokens() {
  const deadToken = '76561199222229128----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIyMjIyOTEyOCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTMzNjkyNjcsICJuYmYiOiAxNzE0MjQ2MjkyLCAiaWF0IjogMTcyMjg4NjI5MiwgImp0aSI6ICIwRjdCXzI0RDMwQzNGX0VBN0VFIiwgIm9hdCI6IDE3MjI4ODYyOTIsICJnZW4iOiA0LCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMjEzLjE0Mi45Ny42MSIsICJpcF9jb25maXJtZXIiOiAiMjEzLjE0Mi45Ny42MSIgfQ.EUGCq4QxZQvowVxh5GWVwg6zLiVIeTzS0xXjnc8jjzRlOANB4in9t3fr6ia9_HQScmpdzs-0MQZqto8xeiYrDQ';
  const goodToken = '76561199216635588----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIxNjYzNTU4OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDA4MDk4MzUsICJuYmYiOiAxNzczOTU1MDQyLCAiaWF0IjogMTc4MjU5NTA0MiwgImp0aSI6ICIwMDE0XzI4NjNFMzg2X0JEQ0RGIiwgIm9hdCI6IDE3ODI1OTUwNDIsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI4OC4yNDIuMTg1LjQ3IiwgImlwX2NvbmZpcm1lciI6ICI4OC4yNDIuMTg1LjQ3IiB9.U48kC2D0vY5z-1e-p24-tX716P-Lp9m429wV0N4kUjHw6b-w7Vp8d4Xy8b_t-zms7q7S-zIPRcALPZ33lahff10gCQ';

  const tokens = [
    { label: 'DEAD', token: deadToken },
    { label: 'GOOD', token: goodToken }
  ];

  for (const t of tokens) {
    const [steamid, refreshToken] = t.token.split('----');
    console.log(`\n--- Testing ${t.label} (${steamid}) ---`);
    
    // Steam OAuth token renewal endpoint:
    // POST https://login.steampowered.com/jwt/refresh
    // with cookies or refresh_token
    const res = await fetch('https://login.steampowered.com/jwt/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Valve/Steam HTTP Client 1.0'
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        steamid: steamid
      }).toString()
    });

    console.log('Status:', res.status);
    console.log('Headers:', [...res.headers.entries()].filter(([k]) => k.includes('set-cookie') || k.includes('steam')));
    const text = await res.text();
    console.log('Response length:', text.length, text.slice(0, 300));
  }
}

testAuthTokens();
