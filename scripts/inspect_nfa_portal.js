async function inspectNfaRedeemPortal() {
  console.log('Inspecting nfa.shefu223.shop portal...');
  const res = await fetch('https://nfa.shefu223.shop/');
  const html = await res.text();
  console.log('HTML length:', html.length);

  // find API calls in HTML/JS
  const apiMatches = html.match(/\/api\/[a-zA-Z0-9_\-\/]+/g) || [];
  console.log('APIs in portal HTML:', [...new Set(apiMatches)]);

  const fetchMatches = html.match(/fetch\(['"`]([^'"`]+)['"`]/g) || [];
  console.log('Fetch calls in portal:', fetchMatches);
}

inspectNfaRedeemPortal();
