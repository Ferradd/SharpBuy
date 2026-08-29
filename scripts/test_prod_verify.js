const deadToken = '76561199250626158----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTI1MDYyNjE1OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ1MDI2NDgsICJuYmYiOiAxNzc3NTc0NzQ0LCAiaWF0IjogMTc4NjIxNDc0NCwgImp0aSI6ICIwMDBDXzI4OUMwQTc1XzQ5M0RFIiwgIm9hdCI6IDE3ODYyMTQ3NDQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI3Ny44Ny45OS4xMjQiLCAiaXBfY29uZmlybWVyIjogIjUuMjMxLjQ1LjM0IiB9.zXKAZFGXKgwWaKDN7lAyjT7g-V7V9JwO9lGuXdQM7amDcB5dxeQ3IcsvXkImVw-J1O4phPNYNYRXNWR9iYR1CA';

async function testLiveEndpoint() {
  console.log('Testing https://sharpbuy.org/api/steam-verify with dead token 76561199250626158...');
  try {
    const res = await fetch('https://sharpbuy.org/api/steam-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: deadToken })
    });
    console.log('Status:', res.status);
    console.log('Response JSON:', await res.json());
  } catch (e) {
    console.log('Error:', e.message);
  }
}

testLiveEndpoint();
