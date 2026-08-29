import SteamUser from 'steam-user';

const token = '76561199787712068----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTc4NzcxMjA2OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQwODU0NDEsICJuYmYiOiAxNzc3MTMyNjk3LCAiaWF0IjogMTc4NTc3MjY5NywgImp0aSI6ICIwMDE4XzI4OTJDRkQwX0JCRUZGIiwgIm9hdCI6IDE3ODU3NzI2OTcsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxODguMjQyLjE4NS40NyIsICJpcF9jb25maXJtZXIiOiAiMTg4LjI0Mi4xODUuNDciIH0.Rlv2wSGgWCv4eqaNY7zqAU_JVKOMxh5cu5FPyAa0tYtsg-OiqwyCJI2KKDowPufsubmynUu0aDhfuS6w-UttDw';

async function testToken() {
  const [steamid, refreshToken] = token.split('----');
  console.log('1. Testing Valve AuthenticationService for 76561199787712068...');

  const form = new URLSearchParams();
  form.append('refresh_token', refreshToken);
  form.append('steamid', steamid);

  try {
    const res = await fetch('https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });
    console.log('Valve status:', res.status, await res.json());
  } catch (e) {
    console.log('Valve err:', e.message);
  }

  console.log('\n2. Testing Supplier Warranty Check (shefu223)...');
  try {
    const res2 = await fetch('https://nfa.shefu223.shop/api/nfa-warranty-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: token })
    });
    console.log('Shefu status:', res2.status, await res2.json());
  } catch (e) {
    console.log('Shefu err:', e.message);
  }

  console.log('\n3. Testing steam-user CM logOn...');
  const client = new SteamUser();
  client.logOn({ refreshToken });
  client.on('loggedOn', () => console.log('steam-user: LOGGED ON!'));
  client.on('error', (e) => console.log('steam-user error:', e.message, 'EResult:', e.eresult));
}

testToken();
