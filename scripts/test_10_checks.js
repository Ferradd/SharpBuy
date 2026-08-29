import { verifySteamLogon } from '../api/steam-verify.js';

const token2 = '76561199697754827----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTY5Nzc1NDgyNyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ4OTAxOTMsICJuYmYiOiAxNzYzNjgxNDcwLCAiaWF0IjogMTc3MjMyMTQ3MCwgImp0aSI6ICIwMDAxXzI3QzdENjc1X0Y4NDI1IiwgIm9hdCI6IDE3NzIzMjE0NzAsICJnZW4iOiAxLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMTc4LjIzLjE4Ni4xOTAiLCAiaXBfY29uZmlybWVyIjogIjE3OC4yMy4xODYuMTkwIiB9.JqoedesCSzaRBQvduMSpv9BstUaE90SM6rOrGrrHjhwD0VrA0IIZ19h4wxJ45uwFmlCa1YMalaEeU_pGTmq_DQ';

async function testStability() {
  const [steamid, refreshToken] = token2.split('----');
  console.log('Testing 10 consecutive checks on TOKEN 2 (76561199697754827)...');

  let successCount = 0;
  for (let i = 1; i <= 10; i++) {
    const start = Date.now();
    const res = await verifySteamLogon(refreshToken, steamid);
    const ms = Date.now() - start;
    console.log(`[#${i}] isAlive: ${res.isAlive} | Reason: ${res.reason} | Time: ${ms}ms`);
    if (res.isAlive) successCount++;
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\nFinal score: ${successCount} / 10 succeeded (${(successCount/10)*100}%)`);
}

testStability();
