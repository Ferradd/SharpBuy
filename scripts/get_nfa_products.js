async function getShefuNfaProducts() {
  console.log('Inspecting shefu223.shop homepage for NFA product keys...');
  const res = await fetch('https://shefu223.shop/');
  const html = await res.text();

  // find checkout product identifiers in the JS of homepage
  const nfaItems = html.match(/product:\s*["']([^"']+)["']/g) || [];
  console.log('NFA product keys in JS:', [...new Set(nfaItems)]);

  // search for "5+" or "Medals" in HTML
  const idx = html.indexOf('5+ Medals');
  if (idx !== -1) {
    console.log('Snippet around 5+ Medals:');
    console.log(html.substring(idx - 200, idx + 300));
  }
}

getShefuNfaProducts();
