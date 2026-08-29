async function testNfaDownloads() {
  const orderId = 'nfa_crypto_1787578899662_abca01842e946a95';
  console.log('Fetching keys for order:', orderId);

  const res = await fetch('https://shefu223.shop/api/nfa-downloads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nfa_order: orderId })
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Downloads Data:', JSON.stringify(data, null, 2));
}

testNfaDownloads();
