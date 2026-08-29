async function fetchPaymentPageJs() {
  const res = await fetch('https://nowpayments.io/js/payment-page.js');
  const js = await res.text();
  console.log('JS Length:', js.length);

  // find api calls
  const matches = js.match(/['"`]\/api\/v1\/[^'"`]+['"`]/g) || js.match(/['"`]https:\/\/[^'"`]+\/v1\/[^'"`]+['"`]/g);
  console.log('Matched endpoints:', matches);
}

fetchPaymentPageJs();
