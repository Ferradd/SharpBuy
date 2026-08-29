async function inspectInlineScripts() {
  const url = 'https://shefu223.shop/store/nfa/pay/?order=nfa_dc_1787577149511_c893c55c3353d115';
  const res = await fetch(url);
  const html = await res.text();

  const apiMatches = html.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
  console.log('API endpoints found in HTML:', [...new Set(apiMatches)]);

  // Look for fetch or post in html
  const fetchMatches = html.match(/fetch\(['"`]([^'"`]+)['"`]/g);
  console.log('Fetch calls:', fetchMatches);
}

inspectInlineScripts();
