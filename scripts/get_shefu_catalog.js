async function getShefuProducts() {
  console.log('Inspecting shefu223.shop store products...');
  const res = await fetch('https://shefu223.shop/store/');
  const html = await res.text();

  // Find product slugs in HTML
  const matches = html.match(/product["':\s]+([a-zA-Z0-9_\-]+)/g) || [];
  console.log('Product matches:', [...new Set(matches)]);

  // Look for data-product attributes or forms
  const dataProds = html.match(/data-product=["']([^"']+)["']/g) || [];
  console.log('Data products:', [...new Set(dataProds)]);

  const nameMatches = html.match(/\/store\/nfa\/[a-zA-Z0-9_\-]+/g) || [];
  console.log('Store URLs:', [...new Set(nameMatches)]);
}

getShefuProducts();
