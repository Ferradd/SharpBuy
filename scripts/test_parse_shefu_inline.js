async function parseShefuInlineHtml() {
  const res = await fetch('https://nfa.shefu223.shop');
  const html = await res.text();
  
  const apiMatches = [...html.matchAll(/\/api\/[a-zA-Z0-9_\-]+/g)].map(m => m[0]);
  console.log('APIs in nfa.shefu223.shop HTML:', [...new Set(apiMatches)]);

  const warrantySnippets = html.match(/.{0,50}warranty.{0,120}/gi) || [];
  console.log('\nWarranty snippets in HTML:');
  for (const s of warrantySnippets.slice(0, 10)) {
    console.log('-', s.trim());
  }
}

parseShefuInlineHtml();
