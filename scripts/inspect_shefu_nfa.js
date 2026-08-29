async function inspectShefuNfaPage() {
  const res = await fetch('https://shefu223.shop/store/nfa/');
  const html = await res.text();
  console.log('NFA page length:', html.length);

  // find product strings
  const items = html.match(/product["':\s]+([a-zA-Z0-9_\-]+)/g) || [];
  console.log('Product matches:', [...new Set(items)]);

  // find product objects in script
  const scriptProds = html.match(/id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["']/g) || [];
  console.log('Products:', scriptProds);

  // find prices
  const priceMatches = html.match(/price:\s*([0-9.]+)/g) || [];
  console.log('Prices in JS:', [...new Set(priceMatches)]);
}

inspectShefuNfaPage();
