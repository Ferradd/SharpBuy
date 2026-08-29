async function testValveResponse() {
  const deadToken1 = '76561199250626158----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTI1MDYyNjE1OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ1MDI2NDgsICJuYmYiOiAxNzc3NTc0NzQ0LCAiaWF0IjogMTc4NjIxNDc0NCwgImp0aSI6ICIwMDBDXzI4OUMwQTc1XzQ5M0RFIiwgIm9hdCI6IDE3ODYyMTQ3NDQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI3Ny44Ny45OS4xMjQiLCAiaXBfY29uZmlybWVyIjogIjUuMjMxLjQ1LjM0IiB9.zXKAZFGXKgwWaKDN7lAyjT7g-V7V9JwO9lGuXdQM7amDcB5dxeQ3IcsvXkImVw-J1O4phPNYNYRXNWR9iYR1CA';
  const deadToken2 = '76561199787712068----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTc4NzcxMjA2OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQwODU0NDEsICJuYmYiOiAxNzc3MTMyNjk3LCAiaWF0IjogMTc4NTc3MjY5NywgImp0aSI6ICIwMDE4XzI4OTJDRkQwX0JCRUZGIiwgIm9hdCI6IDE3ODU3NzI2OTcsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxODguMjQyLjE4NS40NyIsICJpcF9jb25maXJtZXIiOiAiMTg4LjI0Mi4xODUuNDciIH0.Rlv2wSGgWCv4eqaNY7zqAU_JVKOMxh5cu5FPyAa0tYtsg-OiqwyCJI2KKDowPufsubmynUu0aDhfuS6w-UttDw';
  const workingToken = '76561199773433845----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTc3MzQzMzg0NSIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ0NDEzODMsICJuYmYiOiAxNzc3NTE4NzIzLCAiaWF0IjogMTc4NjE1ODcyMywgImp0aSI6ICIwMDBDXzI4OUMwQTY4X0U3RjIxIiwgIm9hdCI6IDE3ODYxNTg3MjMsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxODUuMTczLjIwNC4zMiIsICJpcF9jb25maXJtZXIiOiAiMTg1LjE3My4yMDQuMzIiIH0.T8XJnxGnAtTk2u867aW63D672c7F0yvmH-NgoWOaUo-w2Rpnd3Xy8b_t-zms7q7S-zIPRcALPZ33lahff10gCQ';

  const tokens = [
    { label: 'USER DEAD 76561199250626158', t: deadToken1 },
    { label: 'USER DEAD 76561199787712068', t: deadToken2 },
    { label: 'PREV WORKING 76561199773433845', t: workingToken }
  ];

  for (const item of tokens) {
    const [steamid, refreshToken] = item.t.split('----');
    console.log(`\n=== Testing [${item.label}] ===`);

    const form = new URLSearchParams();
    form.append('refresh_token', refreshToken);
    form.append('steamid', steamid);

    try {
      const res = await fetch('https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString()
      });
      const data = await res.json();
      console.log('Valve Status:', res.status, 'Response:', JSON.stringify(data));
      if (data && data.response && data.response.access_token) {
        console.log('>>> RESULT: 🟢 100% VALID & ALIVE (Got Access Token)');
      } else {
        console.log('>>> RESULT: 🔴 DEAD / ACCESS DENIED (Empty response from Valve)');
      }
    } catch (e) {
      console.log('Err:', e.message);
    }
  }
}

testValveResponse();
