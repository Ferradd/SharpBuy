async function inspectClientApi() {
  const url = 'https://www.skinpock.com/inventory/76561199222229128';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  
  // Find all api routes mentioned in JS scripts
  const matches = html.match(/https?:\/\/[^\s"']+/g) || [];
  const apiUrls = matches.filter(m => m.includes('api') || m.includes('steam') || m.includes('inventory') || m.includes('price'));
  console.log('Detected URLs:', [...new Set(apiUrls)]);
}

inspectClientApi();
