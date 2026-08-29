async function searchChunks() {
  const url = 'https://www.skinpock.com/inventory/76561199222229128';
  const res = await fetch(url);
  const html = await res.text();
  const scriptTags = html.match(/src="(\/_next\/static\/chunks\/[^"]+)"/g) || [];
  
  for (const s of scriptTags) {
    const src = s.match(/src="([^"]+)"/)[1];
    const jsUrl = 'https://www.skinpock.com' + src;
    const jsRes = await fetch(jsUrl);
    const jsCode = await jsRes.text();
    if (jsCode.includes('inventory') || jsCode.includes('steamwebapi') || jsCode.includes('socket')) {
      // Find matches around inventory or steamwebapi
      const matches = jsCode.match(/(\/[a-zA-Z0-9_\-\/]+\?steamId=[^"'`\s]+|https?:\/\/[^"'`\s]+\/inventory[^"'`\s]*)/g) || [];
      if (matches.length) {
        console.log(`In ${src}:`, matches);
      }
    }
  }
}

searchChunks();
