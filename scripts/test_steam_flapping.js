import SteamUser from 'steam-user';

const token1 = '76561199388981206----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTM4ODk4MTIwNiIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDUyNTUxODgsICJuYmYiOiAxNzc4MzA4MDU0LCAiaWF0IjogMTc4Njk0ODA1NCwgImp0aSI6ICIwMDEzXzI4QTZCQTExXzU3NEFDIiwgIm9hdCI6IDE3ODY5NDgwNTQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI4NS4xNzQuMTgwLjU2IiwgImlwX2NvbmZpcm1lciI6ICIxNjMuNTMuMjQ0LjIwMSIgfQ.Lg6nP1giDda2k6BfO34jIZow_MZ2s9kCnp0Ni6ZIIhMsok9c_mQIyDT0ZFOyKnUHq0JXXuxcNpCiP0ju9Le_Ag';
const token2 = '76561199697754827----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTY5Nzc1NDgyNyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ4OTAxOTMsICJuYmYiOiAxNzYzNjgxNDcwLCAiaWF0IjogMTc3MjMyMTQ3MCwgImp0aSI6ICIwMDAxXzI3QzdENjc1X0Y4NDI1IiwgIm9hdCI6IDE3NzIzMjE0NzAsICJnZW4iOiAxLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMTc4LjIzLjE4Ni4xOTAiLCAiaXBfY29uZmlybWVyIjogIjE3OC4yMy4xODYuMTkwIiB9.JqoedesCSzaRBQvduMSpv9BstUaE90SM6rOrGrrHjhwD0VrA0IIZ19h4wxJ45uwFmlCa1YMalaEeU_pGTmq_DQ';

async function testTokenMulti(tokenStr, label, times = 5) {
  const [steamid, refreshToken] = tokenStr.split('----');
  console.log(`\n========================================`);
  console.log(`Testing [${label}] (SteamID: ${steamid}) x ${times} times`);
  console.log(`========================================`);

  for (let i = 1; i <= times; i++) {
    const start = Date.now();
    const res = await new Promise((resolve) => {
      const client = new SteamUser({
        promptSteamGuardCode: false,
        autoRelogin: false,
        singleSentryfile: true,
        dataDirectory: null
      });

      let done = false;
      const finish = (result) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { client.logOff(); } catch (e) {}
        resolve(result);
      };

      const timer = setTimeout(() => {
        finish({ isAlive: false, reason: 'TIMEOUT_6S', duration: Date.now() - start });
      }, 6000);

      client.logOn({ refreshToken });

      client.on('loggedOn', () => {
        finish({ isAlive: true, reason: 'LOGGED_ON_SUCCESS', duration: Date.now() - start });
      });

      client.on('error', (err) => {
        finish({ isAlive: false, reason: err.message, eresult: err.eresult, duration: Date.now() - start });
      });
    });

    console.log(`Attempt ${i}: isAlive=${res.isAlive} | Reason: ${res.reason} | Time: ${res.duration}ms`);
    // Sleep 1s between attempts
    await new Promise(r => setTimeout(r, 1000));
  }
}

async function run() {
  await testTokenMulti(token1, 'TOKEN 1 (76561199388981206)', 5);
  await testTokenMulti(token2, 'TOKEN 2 (76561199697754827)', 5);
}

run();
