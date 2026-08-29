import fs from 'fs';

async function testComparison() {
  const deadToken = '76561199222229128----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIyMjIyOTEyOCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTMzNjkyNjcsICJuYmYiOiAxNzE0MjQ2MjkyLCAiaWF0IjogMTcyMjg4NjI5MiwgImp0aSI6ICIwRjdCXzI0RDMwQzNGX0VBN0VFIiwgIm9hdCI6IDE3MjI4ODYyOTIsICJnZW4iOiA0LCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMjEzLjE0Mi45Ny42MSIsICJpcF9jb25maXJtZXIiOiAiMjEzLjE0Mi45Ny42MSIgfQ.EUGCq4QxZQvowVxh5GWVwg6zLiVIeTzS0xXjnc8jjzRlOANB4in9t3fr6ia9_HQScmpdzs-0MQZqto8xeiYrDQ';
  const goodToken = '76561198308872864----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODMwODg3Mjg2NCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDA4NjY4NDQsICJuYmYiOiAxNzc0MDEyMDUwLCAiaWF0IjogMTc4MjY1MjA1MCwgImp0aSI6ICIwMDE0XzI4NjRBRUZBX0NGOTUwIiwgIm9hdCI6IDE3ODI2NTIwNTAsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI4MS4xODQuMTIwLjE5NyIsICJpcF9jb25maXJtZXIiOiAiODEuMTg0LjEyMC4xOTciIH0.tIYZoNBQ0YqjBwF1b4CK3sR0pTRAqo9750eltEMQYNUcfqITy3768BBC1P7XyaO85EeOrlmhfRfTcN4tW6iEDw';

  console.log('--- 1. Testing nfa-warranty-claim for DEAD TOKEN (76561199222229128) ---');
  const resDead = await fetch('https://nfa.shefu223.shop/api/nfa-warranty-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ license_key: deadToken })
  });
  console.log('Dead token check:', await resDead.json());

  console.log('\n--- 2. Testing nfa-warranty-claim for GOOD TOKEN (76561198308872864) ---');
  const resGood = await fetch('https://nfa.shefu223.shop/api/nfa-warranty-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ license_key: goodToken })
  });
  console.log('Good token check:', await resGood.json());
}

testComparison();
