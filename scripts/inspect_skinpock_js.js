async function getScripts() {
  const url = 'https://www.skinpock.com/inventory/76561199222229128';
  const res = await fetch(url);
  const html = await res.text();
  const scriptTags = html.match(/src="(\/_next\/static\/chunks\/[^"]+)"/g) || [];
  console.log('Script tags:', scriptTags);
  
  for (const s of scriptTags) {
    const src = s.match(/src="([^"]+)"/)[1];
    const jsUrl = 'https://www.skinpock.com' + src;
    const jsRes = await fetch(jsUrl);
    const jsCode = await jsRes.text();
    // Search for API requests inside JS
    const apiCalls = jsCode.match(/https?:\/\/[a-zA-Z0-9.-]+\/[^"'`\s)]+/g) || [];
    const relCalls = jsCode.match(/\/api\/[^"'`\s)]+/g) || [];
    console.log(`\nIn ${src}:`);
    if (apiCalls.length) console.log('  Abs API calls:', apiCalls.slice(0, 5));
    if (relCalls.length) console.log('  Rel API calls:', relCalls.slice(0, 5));
  }
}

getScripts();
