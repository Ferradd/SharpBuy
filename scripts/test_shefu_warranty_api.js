async function testShefuWarranty() {
  const testLicenseKey = 'RATING15K57IZ2JJHYZ5PAO13TG52';
  const testToken = '76561199621492593----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTYyMTQ5MjU5MyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3ODg5MjM1NjEsICJuYmYiOiAxNzYyMDc3NjM3LCAiaWF0IjogMTc3MDcxNzYzNywgImp0aSI6ICIwMDEzXzI3QUMyN0MyXzQ2N0I2IiwgIm9hdCI6IDE3NzA3MTc2MzcsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxNzguMjE0LjI1NC44IiwgImlwX2NvbmZpcm1lciI6ICIyMy4yNTEuMzUuNzIiIH0.E7fXi5A5R1M8yzVFZfBPyV_8IPVdS9ofxJe8nG6IL_ew6Lc5sQK2U2mP1TsBNQ5x-esgUQ5EsaIW_22G_u5rAw';

  console.log('--- 1. Testing Warranty Check with License Key ---');
  try {
    const res1 = await fetch('https://nfa.shefu223.shop/api/nfa-warranty-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: testLicenseKey })
    });
    console.log('Res1 status:', res1.status);
    const json1 = await res1.json();
    console.log('Res1 data:', json1);
  } catch (e) {
    console.log('Res1 error:', e.message);
  }

  console.log('\n--- 2. Testing Warranty Check with Token string ---');
  try {
    const res2 = await fetch('https://nfa.shefu223.shop/api/nfa-warranty-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: testToken })
    });
    console.log('Res2 status:', res2.status);
    const json2 = await res2.json();
    console.log('Res2 data:', json2);
  } catch (e) {
    console.log('Res2 error:', e.message);
  }

  console.log('\n--- 3. Testing Warranty Check with { token: testToken } ---');
  try {
    const res3 = await fetch('https://nfa.shefu223.shop/api/nfa-warranty-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: testToken, account: testToken })
    });
    console.log('Res3 status:', res3.status);
    const json3 = await res3.json();
    console.log('Res3 data:', json3);
  } catch (e) {
    console.log('Res3 error:', e.message);
  }
}

testShefuWarranty();
