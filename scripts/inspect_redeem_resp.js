async function inspectRedeemResponseSnippet() {
  const res = await fetch('https://nfa.shefu223.shop/');
  const html = await res.text();

  const idx = html.indexOf('/api/nfa-redeem');
  if (idx !== -1) {
    console.log(html.substring(idx, idx + 1200));
  }
}

inspectRedeemResponseSnippet();
