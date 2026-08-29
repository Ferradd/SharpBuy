async function inspectShefuStore() {
  const res = await fetch('https://shefu223.shop/store/nfa/');
  const html = await res.text();
  console.log('Store page length:', html.length);

  // find script tags or inline js
  const matches = html.match(/fetch\(['"`]([^'"`]+)['"`]/g);
  console.log('Fetch calls on store page:', matches);

  const apis = html.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
  console.log('All /api/ matches on store page:', [...new Set(apis)]);
}

inspectShefuStore();
