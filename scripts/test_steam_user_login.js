import SteamUser from 'steam-user';

const testToken = '76561198308872864----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODMwODg3Mjg2NCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDA4NjY4NDQsICJuYmYiOiAxNzc0MDEyMDUwLCAiaWF0IjogMTc4MjY1MjA1MCwgImp0aSI6ICIwMDE0XzI4NjRBRUZBX0NGOTUwIiwgIm9hdCI6IDE3ODI2NTIwNTAsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI4MS4xODQuMTIwLjE5NyIsICJpcF9jb25maXJtZXIiOiAiODEuMTg0LjEyMC4xOTciIH0.tIYZoNBQ0YqjBwF1b4CK3sR0pTRAqo9750eltEMQYNUcfqITy3768BBC1P7XyaO85EeOrlmhfRfTcN4tW6iEDw';

async function testSteamUserLogon(tokenStr) {
  const [steamid, refreshToken] = tokenStr.split('----');
  console.log(`Connecting to Steam CM network for SteamID: ${steamid}...`);

  return new Promise((resolve) => {
    const client = new SteamUser();
    
    const timeout = setTimeout(() => {
      client.logOff();
      resolve({ steamid, success: false, reason: 'TIMEOUT' });
    }, 12000);

    client.logOn({
      refreshToken: refreshToken
    });

    client.on('loggedOn', (details) => {
      clearTimeout(timeout);
      console.log(`✅ [LOGON SUCCESS] Logged into Steam as ${client.steamID?.getSteamID64()}! Account is 100% ALIVE!`);
      client.logOff();
      resolve({ steamid, success: true, details });
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      console.log(`❌ [LOGON FAILED] Error: ${err.message} (EResult: ${err.eresult})`);
      resolve({ steamid, success: false, reason: err.message, eresult: err.eresult });
    });
  });
}

testSteamUserLogon(testToken);
