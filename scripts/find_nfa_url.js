async function findNfaCatalogUrl() {
  const res = await fetch('https://shefu223.shop/');
  const html = await res.text();

  const links = html.match(/href=["']([^"']+)["']/g) || [];
  console.log('Links on shefu homepage:', [...new Set(links)]);

  // check if there's /store/nfa/ or similar
  for (let l of links) {
    if (l.includes('nfa') || l.includes('account') || l.includes('cs2')) {
      console.log('NFA link:', l);
    }
  }
}

findNfaCatalogUrl();
