async function testSkinpock() {
  const id = '76561199222229128';
  
  // Try various endpoints
  const endpoints = [
    `https://www.skinpock.com/api/inventory/${id}`,
    `https://www.skinpock.com/api/profile/${id}`,
    `https://api.skinpock.com/inventory/${id}`,
    `https://www.skinpock.com/inventory/${id}`,
    `https://steamwebapi.com/api/inventory/${id}`
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/html'
        }
      });
      console.log(`Endpoint: ${ep} -> Status: ${res.status}`);
      const text = await res.text();
      console.log(`Preview:`, text.slice(0, 300));
    } catch (e) {
      console.log(`Endpoint: ${ep} -> Error:`, e.message);
    }
  }
}

testSkinpock();
