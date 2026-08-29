async function findNfaProductSlugs() {
  const res = await fetch('https://shefu223.shop/store/nfa/');
  const html = await res.text();

  const dataProds = html.match(/data-product=["']([^"']+)["']/g) || [];
  console.log('All data-product values in /store/nfa/:', [...new Set(dataProds)]);

  const nfaProds = html.match(/data-nfa=["']([^"']+)["']/g) || [];
  console.log('All data-nfa values:', [...new Set(nfaProds)]);

  const idMatches = html.match(/product:\s*["']([^"']+)["']/g) || [];
  console.log('All product: "..." in JS:', [...new Set(idMatches)]);
}

findNfaProductSlugs();
