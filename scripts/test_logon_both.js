import SteamUser from 'steam-user';

// Let's test multiple tokens to see their exact EResult from Steam
const workingToken = '76561199773433845----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTc3MzQzMzg0NSIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ0NDEzODMsICJuYmYiOiAxNzc3NTE4NzIzLCAiaWF0IjogMTc4NjE1ODcyMywgImp0aSI6ICIwMDBDXzI4OUMwQTY4X0U3RjIxIiwgIm9hdCI6IDE3ODYxNTg3MjMsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxODUuMTczLjIwNC4zMiIsICJpcF9jb25maXJtZXIiOiAiMTg1LjE3My4yMDQuMzIiIH0.T8XJnxGnAtTk2u867aW63D672c7F0yvmH-NgoWOaUo-w2Rpnd3Xy8b_t-zms7q7S-zIPRcALPZ33lahff10gCQ';
const deadToken = '76561199250626158----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTI1MDYyNjE1OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ1MDI2NDgsICJuYmYiOiAxNzc3NTc0NzQ0LCAiaWF0IjogMTc4NjIxNDc0NCwgImp0aSI6ICIwMDBDXzI4OUMwQTc1XzQ5M0RFIiwgIm9hdCI6IDE3ODYyMTQ3NDQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI3Ny44Ny45OS4xMjQiLCAiaXBfY29uZmlybWVyIjogIjUuMjMxLjQ1LjM0IiB9.zXKAZFGXKgwWaKDN7lAyjT7g-V7V9JwO9lGuXdQM7amDcB5dxeQ3IcsvXkImVw-J1O4phPNYNYRXNWR9iYR1CA';

async function checkToken(tokenStr, label) {
  const [steamid, refreshToken] = tokenStr.split('----');
  console.log(`\n=== Checking [${label}] ${steamid} ===`);

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
      console.log('✅ SUCCESS! Logged on to Steam as:', client.steamID.getSteamID64());
      client.logOff();
      resolve({ isAlive: true, steamID: client.steamID.getSteamID64() });
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      console.log('❌ FAILED! Error:', err.message, 'EResult:', err.eresult);
      resolve({ isAlive: false, reason: err.message, eresult: err.eresult });
    });
  });
}

async function run() {
  await checkToken(deadToken, 'USER DEAD TOKEN (76561199250626158)');
  await checkToken(workingToken, 'PREVIOUS WORKING TOKEN (76561199773433845)');
}

run();
