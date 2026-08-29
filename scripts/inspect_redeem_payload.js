async function inspectRedeemPayload() {
  const res = await fetch('https://nfa.shefu223.shop/');
  const html = await res.text();

  const idx = html.indexOf('/api/nfa-redeem');
  if (idx !== -1) {
    console.log('Snippet around /api/nfa-redeem:');
    console.log(html.substring(idx - 100, idx + 400));
  }
}

inspectRedeemPayload();
