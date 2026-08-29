async function findNfaCheckoutJS() {
  const res = await fetch('https://shefu223.shop/store/nfa/');
  const html = await res.text();

  const idx = html.indexOf('/api/nfa-checkout');
  if (idx !== -1) {
    console.log('Snippet around /api/nfa-checkout:');
    console.log(html.substring(idx - 250, idx + 400));
  }

  // search for product data definition
  const pIdx = html.indexOf('const PRODUCTS');
  if (pIdx !== -1) {
    console.log('\nSnippet around const PRODUCTS:');
    console.log(html.substring(pIdx, pIdx + 800));
  }
}

findNfaCheckoutJS();
