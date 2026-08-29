import { LoginSession, EAuthTokenPlatformType } from 'steam-session';

async function testSession(rawToken, label) {
  const [steamid, refreshToken] = rawToken.split('----');
  console.log(`\n=== Testing steam-session for ${label} (${steamid}) ===`);
  
  const session = new LoginSession(EAuthTokenPlatformType.SteamClient);
  session.refreshToken = refreshToken;

  try {
    const res = await session.refreshAccessToken();
    console.log('AccessToken refreshed successfully! Token:', res ? res.slice(0, 30) + '...' : 'none');
    console.log('Account is 100% ALIVE and WORKING!');
  } catch (err) {
    console.log('Refresh FAILED! Error:', err.message, 'EResult:', err.eresult);
    console.log('Account is DEAD / REVOKED!');
  }
}

async function run() {
  await testSession('76561199222229128----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIyMjIyOTEyOCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTMzNjkyNjcsICJuYmYiOiAxNzE0MjQ2MjkyLCAiaWF0IjogMTcyMjg4NjI5MiwgImp0aSI6ICIwRjdCXzI0RDMwQzNGX0VBN0VFIiwgIm9hdCI6IDE3MjI4ODYyOTIsICJnZW4iOiA0LCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMjEzLjE0Mi45Ny42MSIsICJpcF9jb25maXJtZXIiOiAiMjEzLjE0Mi45Ny42MSIgfQ.EUGCq4QxZQvowVxh5GWVwg6zLiVIeTzS0xXjnc8jjzRlOANB4in9t3fr6ia9_HQScmpdzs-0MQZqto8xeiYrDQ', 'USER TOKEN 76561199222229128');
  await testSession('76561199773433845----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTc3MzQzMzg0NSIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ0NDEzODMsICJuYmYiOiAxNzc3NTE4NzIzLCAiaWF0IjogMTc4NjE1ODcyMywgImp0aSI6ICIwMDBDXzI4OUMwQTY4X0U3RjIxIiwgIm9hdCI6IDE3ODYxNTg3MjMsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxODUuMTczLjIwNC4zMiIsICJpcF9jb25maXJtZXIiOiAiMTg1LjE3My4yMDQuMzIiIH0.T8XJnxGnAtTk2u867aW63D672c7F0yvmH-NgoWOaUo-w2Rpnd3Xy8b_t-zms7q7S-zIPRcALPZ33lahff10gCQ', 'WORKING TOKEN 76561199773433845');
}

run();
