const deadToken = '76561199222229128----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIyMjIyOTEyOCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTMzNjkyNjcsICJuYmYiOiAxNzE0MjQ2MjkyLCAiaWF0IjogMTcyMjg4NjI5MiwgImp0aSI6ICIwRjdCXzI0RDMwQzNGX0VBN0VFIiwgIm9hdCI6IDE3MjI4ODYyOTIsICJnZW4iOiA0LCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMjEzLjE0Mi45Ny42MSIsICJpcF9jb25maXJtZXIiOiAiMjEzLjE0Mi45Ny42MSIgfQ.EUGCq4QxZQvowVxh5GWVwg6zLiVIeTzS0xXjnc8jjzRlOANB4in9t3fr6ia9_HQScmpdzs-0MQZqto8xeiYrDQ';
const workingToken = '76561199773433845----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTc3MzQzMzg0NSIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ0NDEzODMsICJuYmYiOiAxNzc3NTE4NzIzLCAiaWF0IjogMTc4NjE1ODcyMywgImp0aSI6ICIwMDBDXzI4OUMwQTY4X0U3RjIxIiwgIm9hdCI6IDE3ODYxNTg3MjMsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxODUuMTczLjIwNC4zMiIsICJpcF9jb25maXJtZXIiOiAiMTg1LjE3My4yMDQuMzIiIH0.T8XJnxGnAtTk2u867aW63D672c7F0yvmH-NgoWOaUo-w2Rpnd3Xy8b_t-zms7q7S-zIPRcALPZ33lahff10gCQ';

async function checkShefuEndpoint(rawToken, label) {
  console.log(`\n=== Testing shefu223 token-checker for [${label}] ===`);
  try {
    const res = await fetch('https://shefu223.shop/token-checker/api/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify({ token: rawToken })
    });
    console.log('Status:', res.status);
    console.log('JSON:', await res.json());
  } catch (e) {
    console.log('Error:', e.message);
  }
}

async function run() {
  await checkShefuEndpoint(deadToken, 'DEAD TOKEN (76561199222229128)');
  await checkShefuEndpoint(workingToken, 'WORKING TOKEN (76561199773433845)');
}

run();
