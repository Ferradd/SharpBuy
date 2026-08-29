async function inspectShefuWarrantyFrontend() {
  try {
    const res = await fetch('https://nfa.shefu223.shop');
    console.log('Main status:', res.status);
    const html = await res.text();
    console.log('HTML len:', html.length);
    const scriptMatches = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
    console.log('Script matches:', scriptMatches);

    for (const src of scriptMatches) {
      const fullUrl = src.startsWith('http') ? src : `https://nfa.shefu223.shop${src}`;
      const sRes = await fetch(fullUrl);
      const sCode = await sRes.text();
      console.log(`\n--- Script ${src} (${sCode.length} bytes) ---`);
      const apiMatches = [...sCode.matchAll(/\/api\/[a-zA-Z0-9_\-]+/g)].map(m => m[0]);
      console.log('APIs found in script:', [...new Set(apiMatches)]);

      // Search warranty logic in script
      const warrantySnippets = sCode.match(/.{0,50}warranty.{0,100}/gi) || [];
      console.log('Warranty snippets in script (first 5):', warrantySnippets.slice(0, 5));
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

inspectShefuWarrantyFrontend();
