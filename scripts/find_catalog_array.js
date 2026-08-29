async function findNfaCatalogArray() {
  const res = await fetch('https://shefu223.shop/store/nfa/');
  const html = await res.text();

  const idx = html.indexOf('5+ Medals');
  if (idx !== -1) {
    console.log('Snippet around 5+ Medals:');
    console.log(html.substring(idx - 150, idx + 250));
  }

  const idx2 = html.indexOf('8+ Medals');
  if (idx2 !== -1) {
    console.log('\nSnippet around 8+ Medals:');
    console.log(html.substring(idx2 - 150, idx2 + 250));
  }
}

findNfaCatalogArray();
