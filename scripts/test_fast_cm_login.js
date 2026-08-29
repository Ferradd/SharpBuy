import SteamUser from 'steam-user';

const testToken1 = '76561199250626158----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTI1MDYyNjE1OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ1MDI2NDgsICJuYmYiOiAxNzc3NTc0NzQ0LCAiaWF0IjogMTc4NjIxNDc0NCwgImp0aSI6ICIwMDBDXzI4OUMwQTc1XzQ5M0RFIiwgIm9hdCI6IDE3ODYyMTQ3NDQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI3Ny44Ny45OS4xMjQiLCAiaXBfY29uZmlybWVyIjogIjUuMjMxLjQ1LjM0IiB9.zXKAZFGXKgwWaKDN7lAyjT7g-V7V9JwO9lGuXdQM7amDcB5dxeQ3IcsvXkImVw-J1O4phPNYNYRXNWR9iYR1CA';

async function checkWithSteamUser(tokenStr) {
  const [steamid, refreshToken] = tokenStr.split('----');
  console.log(`Checking SteamID: ${steamid}...`);

  return new Promise((resolve) => {
    const client = new SteamUser({
      promptSteamGuardCode: false,
      autoRelogin: false,
      singleSentryfile: true
    });

    const timeout = setTimeout(() => {
      client.logOff();
      resolve({ isAlive: false, reason: 'Timeout' });
    }, 6000);

    client.logOn({ refreshToken });

    client.on('loggedOn', (details) => {
      clearTimeout(timeout);
      console.log('SUCCESS! Logged on as:', client.steamID.getSteamID64());
      client.logOff();
      resolve({ isAlive: true, steamID: client.steamID.getSteamID64() });
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      console.log('FAILED! Error:', err.message, 'EResult:', err.eresult);
      resolve({ isAlive: false, reason: err.message, eresult: err.eresult });
    });
  });
}

checkWithSteamUser(testToken1).then((res) => {
  console.log('Final Result:', res);
  process.exit(0);
});
