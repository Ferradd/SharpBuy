async function testCheckoutCrypto() {
  console.log('Testing /api/nfa-checkout-crypto (NOWPayments)...');
  try {
    const res = await fetch('https://shefu223.shop/api/nfa-checkout-crypto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ product: 'premier', quantity: 1 }],
        email: 'iliykuzin2@gmail.com'
      })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('NOWPayments checkout result:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

testCheckoutCrypto();
