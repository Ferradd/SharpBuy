async function inspectSuccessPage() {
  const res = await fetch('https://shefu223.shop/success/?nfa_order=nfa_crypto_1787578899662_abca01842e946a95&method=crypto');
  const html = await res.text();
  console.log('Success HTML length:', html.length);

  // find script tags or fetch calls
  const scripts = html.match(/<script[\s\S]*?<\/script>/gi) || [];
  for (let s of scripts) {
    console.log('--- SCRIPT ---');
    console.log(s);
  }
}

inspectSuccessPage();
