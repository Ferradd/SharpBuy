async function checkShefuApi() {
  const tests = [
    { items: [{ product: 'premier', quantity: 1 }], email: 'iliykuzin2@gmail.com' },
    { items: [{ product: 'prime', quantity: 1 }], email: 'iliykuzin2@gmail.com' },
    { items: [{ id: 'premier', quantity: 1 }], email: 'iliykuzin2@gmail.com' },
    { items: [{ name: 'premier', quantity: 1 }], email: 'iliykuzin2@gmail.com' },
    { items: [{ product: 'cs2_prime', quantity: 1 }], email: 'iliykuzin2@gmail.com' },
    { items: [{ product: 'cs2_premier', quantity: 1 }], email: 'iliykuzin2@gmail.com' },
  ];

  for (const t of tests) {
    try {
      const res = await fetch('https://shefu223.shop/api/nfa-checkout-crypto-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t)
      });
      const data = await res.json();
      console.log('Payload:', JSON.stringify(t.items), 'Status:', res.status, 'Response:', data);
    } catch (e) {
      console.error(e);
    }
  }
}

checkShefuApi();
